import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '¿Cuánto dinero pierdes respondiendo mensajes? | Calculadora Itineramio',
  description: 'Calcula en 2 minutos cuántas horas y euros pierdes al mes gestionando mensajes repetitivos de huéspedes. Basado en el análisis de 847 anfitriones en España.',
  openGraph: {
    title: '¿Cuánto dinero pierdes respondiendo mensajes de huéspedes?',
    description: 'Diagnóstico gratuito para anfitriones con más de 6 alojamientos. Calcula tu coste real en 2 minutos.',
    type: 'website',
  },
}

export default function CalculadoraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
