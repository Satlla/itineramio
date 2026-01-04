/**
 * Weekly Analytics Report Email Template
 *
 * Beautiful, mobile-responsive email using React Email
 * Sent every Monday at 9:00 AM with user's weekly analytics
 */

import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export interface WeeklyReportEmailProps {
  userName: string
  weekStart: string
  weekEnd: string
  properties: {
    name: string
    id: string
    views: number
    viewsChange: number // percentage
    avgTimeSpent: number
    rating: number
    totalRatings: number
    preventedCalls: number
    moneySaved: number
    topZones: {
      name: string
      views: number
      rating: number
      status: 'good' | 'warning' | 'critical'
    }[]
  }[]
  totalStats: {
    totalViews: number
    totalPreventedCalls: number
    totalMoneySaved: number
    totalTimeSaved: number // hours
    avgRating: number
    monthlyROI: number
  }
  alerts: {
    severity: 'high' | 'medium' | 'low'
    message: string
    actionText: string
    actionUrl: string
  }[]
  opportunities: {
    message: string
    impact: string
    actionText: string
    actionUrl: string
  }[]
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'

export const WeeklyReportEmail = ({
  userName = 'Carlos',
  weekStart = '15 Ene',
  weekEnd = '21 Ene',
  properties = [
    {
      name: 'Apartamento Barcelona Centro',
      id: 'prop1',
      views: 89,
      viewsChange: 23,
      avgTimeSpent: 4.2,
      rating: 4.7,
      totalRatings: 12,
      preventedCalls: 34,
      moneySaved: 102,
      topZones: [
        { name: 'WiFi', views: 45, rating: 4.9, status: 'good' },
        { name: 'Check-in', views: 38, rating: 4.9, status: 'good' },
        { name: 'Cocina', views: 29, rating: 3.1, status: 'warning' }
      ]
    }
  ],
  totalStats = {
    totalViews: 145,
    totalPreventedCalls: 47,
    totalMoneySaved: 141,
    totalTimeSaved: 6.8,
    avgRating: 4.5,
    monthlyROI: 387
  },
  alerts = [
    {
      severity: 'high',
      message: 'Tu zona "Cocina" tiene un rating de 3.1/5',
      actionText: 'Editar Zona Cocina',
      actionUrl: `${baseUrl}/properties/prop1/zones/zone1/edit`
    }
  ],
  opportunities = [
    {
      message: 'El 34% de tus huéspedes prefiere inglés',
      impact: 'Traducir podría aumentar tu rating a 4.8/5',
      actionText: 'Traducir al inglés',
      actionUrl: `${baseUrl}/properties/prop1/zones`
    }
  ]
}: WeeklyReportEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {`Tu semana en Itineramio: ${totalStats.totalPreventedCalls} llamadas evitadas, €${totalStats.totalMoneySaved} ahorrado`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Img
                  src={`${baseUrl}/logo.png`}
                  width="40"
                  height="40"
                  alt="Itineramio"
                  style={logo}
                />
              </Column>
              <Column align="right">
                <Text style={headerText}>Reporte Semanal</Text>
              </Column>
            </Row>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Heading style={h1}>
              📊 Tu semana en Itineramio
            </Heading>
            <Text style={heroText}>
              Hola {userName},
            </Text>
            <Text style={heroSubtext}>
              Esta semana tu manual digital ahorró <strong>{totalStats.totalTimeSaved} horas</strong> de tu tiempo 🎉
            </Text>
          </Section>

          {/* Weekly Summary Stats */}
          <Section style={statsSection}>
            <Heading style={h2}>
              📈 RESUMEN SEMANAL ({weekStart} - {weekEnd})
            </Heading>

            <Row style={statsRow}>
              <Column style={statBox}>
                <Text style={statNumber}>{totalStats.totalViews}</Text>
                <Text style={statLabel}>Vistas</Text>
              </Column>
              <Column style={statBox}>
                <Text style={statNumber}>{totalStats.totalPreventedCalls}</Text>
                <Text style={statLabel}>Llamadas<br/>evitadas</Text>
              </Column>
              <Column style={statBox}>
                <Text style={statNumber}>€{totalStats.totalMoneySaved}</Text>
                <Text style={statLabel}>Ahorrado</Text>
              </Column>
              <Column style={statBox}>
                <Text style={statNumber}>{totalStats.avgRating.toFixed(1)}</Text>
                <Text style={statLabel}>Rating<br/>promedio</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Property-by-Property Breakdown */}
          {properties.map((property, index) => (
            <Section key={index} style={propertySection}>
              <Heading style={h3}>
                🏠 {property.name}
              </Heading>

              <Row style={propertyStats}>
                <Column>
                  <Text style={propertyStatItem}>
                    👀 <strong>{property.views} vistas</strong>{' '}
                    <span style={property.viewsChange >= 0 ? positiveChange : negativeChange}>
                      {property.viewsChange >= 0 ? '+' : ''}{property.viewsChange}% vs semana anterior
                    </span>
                  </Text>
                  <Text style={propertyStatItem}>
                    ⏱️ <strong>{property.avgTimeSpent.toFixed(1)} min</strong> tiempo promedio
                  </Text>
                  <Text style={propertyStatItem}>
                    ⭐ <strong>{property.rating.toFixed(1)}/5</strong> rating ({property.totalRatings} evaluaciones)
                  </Text>
                  <Text style={propertyStatItem}>
                    📞 <strong>{property.preventedCalls} llamadas evitadas</strong> → €{property.moneySaved} ahorrado
                  </Text>
                </Column>
              </Row>

              {/* Top Zones */}
              {property.topZones.length > 0 && (
                <>
                  <Text style={subsectionTitle}>🎯 Zonas más consultadas:</Text>
                  {property.topZones.map((zone, zoneIndex) => (
                    <Row key={zoneIndex} style={zoneRow}>
                      <Column style={{ width: '70%' }}>
                        <Text style={zoneName}>
                          {zoneIndex + 1}. {zone.name}
                          <span style={zoneViews}> ({zone.views} vistas)</span>
                        </Text>
                      </Column>
                      <Column style={{ width: '30%' }} align="right">
                        {zone.status === 'good' && <Text style={statusGood}>✅ {zone.rating.toFixed(1)}/5</Text>}
                        {zone.status === 'warning' && <Text style={statusWarning}>⚠️ {zone.rating.toFixed(1)}/5</Text>}
                        {zone.status === 'critical' && <Text style={statusCritical}>🔴 {zone.rating.toFixed(1)}/5</Text>}
                      </Column>
                    </Row>
                  ))}
                </>
              )}
            </Section>
          ))}

          <Hr style={divider} />

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <Section style={alertsSection}>
              <Heading style={h2}>
                ⚠️ ACCIÓN REQUERIDA
              </Heading>

              {alerts.map((alert, index) => (
                <Section key={index} style={alertBox(alert.severity)}>
                  <Text style={alertText}>{alert.message}</Text>
                  <Button style={alertButton} href={alert.actionUrl}>
                    {alert.actionText}
                  </Button>
                </Section>
              ))}
            </Section>
          )}

          {/* Opportunities Section */}
          {opportunities.length > 0 && (
            <Section style={opportunitiesSection}>
              <Heading style={h2}>
                💡 OPORTUNIDADES
              </Heading>

              {opportunities.map((opportunity, index) => (
                <Section key={index} style={opportunityBox}>
                  <Text style={opportunityText}>
                    <strong>{opportunity.message}</strong>
                  </Text>
                  <Text style={opportunityImpact}>
                    {opportunity.impact}
                  </Text>
                  <Button style={opportunityButton} href={opportunity.actionUrl}>
                    {opportunity.actionText}
                  </Button>
                </Section>
              ))}
            </Section>
          )}

          <Hr style={divider} />

          {/* Monthly Total */}
          <Section style={monthlySection}>
            <Heading style={h2}>
              📊 TOTAL MES ENERO (hasta ahora)
            </Heading>

            <Row style={monthlyStats}>
              <Column>
                <Text style={monthlyStatItem}>
                  💰 <strong>ROI: +{totalStats.monthlyROI}%</strong>
                </Text>
                <Text style={monthlyStatSubtext}>
                  €{totalStats.totalMoneySaved} ahorrado vs €29 pagado
                </Text>
              </Column>
            </Row>

            <Row style={monthlyStats}>
              <Column style={{ width: '50%' }}>
                <Text style={monthlyStatItem}>
                  ⏱️ {totalStats.totalTimeSaved} horas ahorradas
                </Text>
              </Column>
              <Column style={{ width: '50%' }}>
                <Text style={monthlyStatItem}>
                  📞 {totalStats.totalPreventedCalls} llamadas evitadas
                </Text>
              </Column>
            </Row>

            <Row style={monthlyStats}>
              <Column>
                <Text style={monthlyStatItem}>
                  ⭐ {totalStats.avgRating.toFixed(1)}/5 rating promedio
                </Text>
              </Column>
            </Row>

            <Section style={{ textAlign: 'center', marginTop: '24px' }}>
              <Button style={primaryButton} href={`${baseUrl}/analytics`}>
                Ver Analytics Completas
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            <Text style={footerText}>
              Este email fue enviado por <Link href={baseUrl} style={footerLink}>Itineramio</Link>
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/account/settings`} style={footerLink}>
                Configurar notificaciones
              </Link>
              {' · '}
              <Link href={`${baseUrl}/account/settings`} style={footerLink}>
                Actualizar preferencias
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © 2025 Itineramio. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WeeklyReportEmail

// ============================================================================
// STYLES
// ============================================================================

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '20px 40px',
}

const logo = {
  borderRadius: '8px',
}

const headerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  fontWeight: '600',
}

const heroSection = {
  padding: '0 40px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: '700',
  margin: '40px 0',
  padding: '0',
  lineHeight: '1.2',
}

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '700',
  margin: '32px 0 16px',
  padding: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

const h3 = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '600',
  margin: '16px 0',
  padding: '0',
}

const heroText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const heroSubtext = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const statsSection = {
  padding: '32px 40px',
  backgroundColor: '#f9fafb',
  margin: '32px 0',
}

const statsRow = {
  marginTop: '24px',
}

const statBox = {
  textAlign: 'center' as const,
  padding: '16px',
}

const statNumber = {
  color: '#7c3aed',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '1',
  margin: '0',
}

const statLabel = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 40px',
}

const propertySection = {
  padding: '0 40px',
  margin: '24px 0',
}

const propertyStats = {
  marginTop: '16px',
}

const propertyStatItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
}

const positiveChange = {
  color: '#10b981',
  fontWeight: '600',
}

const negativeChange = {
  color: '#ef4444',
  fontWeight: '600',
}

const subsectionTitle = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '600',
  marginTop: '24px',
  marginBottom: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

const zoneRow = {
  padding: '8px 0',
  borderBottom: '1px solid #f3f4f6',
}

const zoneName = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const zoneViews = {
  color: '#9ca3af',
  fontSize: '12px',
}

const statusGood = {
  color: '#10b981',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const statusWarning = {
  color: '#f59e0b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const statusCritical = {
  color: '#ef4444',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const alertsSection = {
  padding: '32px 40px',
}

const alertBox = (severity: 'high' | 'medium' | 'low') => ({
  backgroundColor: severity === 'high' ? '#fef2f2' : severity === 'medium' ? '#fffbeb' : '#f0fdf4',
  border: `2px solid ${severity === 'high' ? '#fecaca' : severity === 'medium' ? '#fde68a' : '#bbf7d0'}`,
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
})

const alertText = {
  color: '#1f2937',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
}

const alertButton = {
  backgroundColor: '#ef4444',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
}

const opportunitiesSection = {
  padding: '32px 40px',
}

const opportunityBox = {
  backgroundColor: '#eff6ff',
  border: '2px solid #dbeafe',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const opportunityText = {
  color: '#1f2937',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
}

const opportunityImpact = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '18px',
  margin: '0 0 16px',
}

const opportunityButton = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
}

const monthlySection = {
  padding: '32px 40px',
  backgroundColor: '#f9fafb',
  margin: '32px 0',
}

const monthlyStats = {
  marginTop: '16px',
}

const monthlyStatItem = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
}

const monthlyStatSubtext = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0 0',
}

const primaryButton = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
}

const footer = {
  padding: '0 40px',
}

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '32px 0 16px',
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '8px 0',
}

const footerLink = {
  color: '#7c3aed',
  textDecoration: 'underline',
}

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '11px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '16px 0 0',
}
