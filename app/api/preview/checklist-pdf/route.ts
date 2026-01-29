import { NextResponse } from 'next/server'
import { generateCleaningChecklistPDF } from '@/lib/pdf-generator-server'

// Demo data for preview
const demoSections = [
  {
    title: 'Cocina',
    items: [
      'Limpiar encimera y superficies',
      'Limpiar electrodomésticos por fuera',
      'Limpiar microondas por dentro',
      'Limpiar nevera por dentro y por fuera',
      'Limpiar detrás de la nevera',
      'Limpiar filtro de campana extractora',
      'Limpiar vitrocerámica/fogones',
      'Limpiar horno por dentro',
      'Limpiar lavavajillas',
      'Revisar filtro del lavavajillas',
      'Limpiar fregadero y grifería',
      'Reponer productos de limpieza'
    ]
  },
  {
    title: 'Baño',
    items: [
      'Limpiar y desinfectar inodoro',
      'Limpiar lavabo y grifería',
      'Limpiar ducha/bañera',
      'Limpiar mampara de ducha',
      'Limpiar azulejos y juntas',
      'Limpiar espejo',
      'Vaciar papelera',
      'Reponer toallas limpias',
      'Reponer papel higiénico',
      'Reponer jabón y amenities',
      'Revisar desagües'
    ]
  },
  {
    title: 'Dormitorio',
    items: [
      'Cambiar sábanas y fundas',
      'Pasar rodillo quitapelusas a sábanas',
      'Hacer la cama correctamente',
      'Limpiar mesitas de noche',
      'Limpiar interior de armarios',
      'Limpiar exterior de armarios',
      'Revisar perchas disponibles',
      'Limpiar debajo de la cama',
      'Aspirar colchón',
      'Vaciar papelera'
    ]
  },
  {
    title: 'Salón',
    items: [
      'Aspirar sofá y cojines',
      'Limpiar mesa de centro',
      'Quitar polvo de muebles',
      'Limpiar TV y pantallas',
      'Revisar mandos con pilas',
      'Limpiar ventanas por dentro',
      'Limpiar raíles de ventanas',
      'Limpiar persianas',
      'Limpiar cortinas',
      'Vaciar papelera'
    ]
  },
  {
    title: 'General',
    items: [
      'Barrer y fregar suelos',
      'Aspirar alfombras',
      'Limpiar rodapiés',
      'Limpiar puertas y marcos',
      'Limpiar interruptores y enchufes',
      'Limpiar radiadores',
      'Limpiar filtros de aire acondicionado',
      'Revisar que todo funciona',
      'Reponer consumibles',
      'Sacar basura',
      'Ventilar todas las estancias',
      'Inspección final'
    ]
  }
]

export async function GET() {
  try {
    const pdfBuffer = generateCleaningChecklistPDF({
      propertyName: 'Apartamento Centro Madrid',
      propertyAddress: 'Calle Gran Vía 25, 3ºB',
      sections: demoSections,
      userName: 'Demo'
    })

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="checklist-preview.pdf"'
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}
