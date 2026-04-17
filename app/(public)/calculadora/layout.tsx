import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora Coste Mensajes Huéspedes | Itineramio',
  description: 'Calcula en 2 min cuántas horas y euros pierdes gestionando mensajes de huéspedes. Basado en 847 anfitriones en España. Gratis.',
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
