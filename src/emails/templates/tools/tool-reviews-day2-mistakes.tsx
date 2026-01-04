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
}

export default function ToolReviewsDay2Mistakes({
  name = 'anfitrión'
}: ToolReviewsDay2Props) {
  return (
    <Html>
      <Head />
      <Preview>5 errores que están arruinando tus reseñas en Airbnb</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>ITINERAMIO</Text>

          <Heading style={heading}>
            5 errores que arruinan tus reseñas
          </Heading>

          <Text style={paragraph}>
            Hola {name},
          </Text>

          <Text style={paragraph}>
            Después de analizar cientos de propiedades, hemos identificado los
            <strong> 5 errores más comunes</strong> que bajan el rating de los anfitriones.
            Evítalos y verás cómo suben tus estrellas.
          </Text>

          <Section style={errorBox}>
            <Text style={errorNumber}>1</Text>
            <Text style={errorTitle}>No responder antes de 1 hora</Text>
            <Text style={errorText}>
              El 68% de las reseñas negativas mencionan "comunicación lenta".
              Airbnb premia a los SuperHost que responden en menos de 1 hora.
            </Text>
          </Section>

          <Section style={errorBox}>
            <Text style={errorNumber}>2</Text>
            <Text style={errorTitle}>Fotos que no coinciden con la realidad</Text>
            <Text style={errorText}>
              Las expectativas vs realidad es el killer #1 de reseñas. Si renovaste
              hace 3 años, actualiza las fotos.
            </Text>
          </Section>

          <Section style={errorBox}>
            <Text style={errorNumber}>3</Text>
            <Text style={errorTitle}>Check-in confuso o tardío</Text>
            <Text style={errorText}>
              El huésped llega cansado del viaje. Si el check-in es complicado,
              empiezas con -1 estrella mental.
            </Text>
          </Section>

          <Section style={errorBox}>
            <Text style={errorNumber}>4</Text>
            <Text style={errorTitle}>No anticipar problemas conocidos</Text>
            <Text style={errorText}>
              Si sabes que hay obras en el edificio o ruido de la calle, avisa ANTES.
              Los huéspedes perdonan problemas, no sorpresas.
            </Text>
          </Section>

          <Section style={errorBox}>
            <Text style={errorNumber}>5</Text>
            <Text style={errorTitle}>No pedir feedback antes de la reseña</Text>
            <Text style={errorText}>
              Envía un mensaje el día antes del checkout: "¿Todo bien? ¿Necesitas algo?"
              Así resuelves problemas ANTES de que lleguen a la reseña.
            </Text>
          </Section>

          <Section style={tipBox}>
            <Text style={tipTitle}>Pro tip</Text>
            <Text style={tipText}>
              La mayoría de reseñas de 4 estrellas vienen de pequeños detalles
              acumulados. Un WiFi lento + una toalla manchada + un grifo que gotea
              = 4 estrellas aunque el piso sea espectacular.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Link href="https://www.itineramio.com/register" style={button}>
              Automatiza tu comunicación
            </Link>
            <Text style={ctaSubtext}>
              Con Itineramio, tus huéspedes tienen toda la info que necesitan
              sin tener que preguntarte.
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
