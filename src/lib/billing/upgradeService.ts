/**
 * Service for generating upgrade marketing messages
 */

interface UpgradePreview {
  fromPlan: { name: string; monthly: number }
  toPlan: { name: string; monthly: number }
  totalProperties: number
  currentUnitPrice: number
  newUnitPrice: number
  savingsPerProperty: number
  prorationRefund: number
  immediateCharge: number
}

interface UpgradeMessages {
  headline: string
  savings: string
  proration: string
  urgency?: string
}

export function generateUpgradeMessages(preview: UpgradePreview): UpgradeMessages {
  const { fromPlan, toPlan, savingsPerProperty, prorationRefund, immediateCharge } = preview

  // Generate headline
  const headline = `Actualiza a ${toPlan.name}`

  // Generate savings message
  const savingsMessage = savingsPerProperty > 0
    ? `Ahorra €${savingsPerProperty.toFixed(2)} por propiedad`
    : `Accede a más propiedades con ${toPlan.name}`

  // Generate proration message
  const prorationMessage = prorationRefund > 0
    ? `Recibirás un crédito de €${prorationRefund.toFixed(2)} de tu plan actual`
    : `Pago inmediato: €${immediateCharge.toFixed(2)}`

  // Generate urgency message (optional)
  const urgencyMessage = savingsPerProperty > 5
    ? `¡Gran ahorro disponible!`
    : undefined

  return {
    headline,
    savings: savingsMessage,
    proration: prorationMessage,
    urgency: urgencyMessage
  }
}
