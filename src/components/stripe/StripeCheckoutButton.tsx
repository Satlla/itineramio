'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/Button'
import { Loader2, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface StripeCheckoutButtonProps {
  propertyCount: number
  planCode?: string // Opcional - se deduce automáticamente si no se proporciona
  pricing: {
    total: number
    tier: string
    effectivePropertyCount: number
  }
  disabled?: boolean
  className?: string
}

export function StripeCheckoutButton({
  propertyCount,
  planCode,
  pricing,
  disabled = false,
  className
}: StripeCheckoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    if (pricing.total === 0) {
      toast.error('Error: Plan sin precio configurado')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: propertyCount,  // El API espera 'properties' no 'propertyCount'
          planCode: planCode || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        
        // Si Stripe no está configurado, mostrar mensaje específico
        if (error.requiresSetup) {
          toast.error('Stripe no está configurado. Usa "Seleccionar" para pago manual.')
          return
        }
        
        throw new Error(error.error || 'Error al crear checkout')
      }

      const result = await response.json()

      if (result.url) {
        // Si la URL empieza con https:// es una URL de Stripe real
        if (result.url.startsWith('https://')) {
          // Redirigir a Stripe Checkout
          window.location.href = result.url
        } else {
          // Si es modo demo o URL local, mostrar mensaje
          toast.error('Stripe no está configurado. Por favor, usa el botón "Seleccionar" para pago manual.')
        }
      } else {
        toast.success(result.message || 'Plan activado correctamente')
      }

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al procesar el pago')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Pagar con tarjeta
        </>
      )}
    </Button>
  )
}