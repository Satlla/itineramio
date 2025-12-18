import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const vutArticles = [
  {
    slug: 'vut-madrid-requisitos-2025',
    title: 'VUT Madrid 2025: Requisitos, Licencia y Manual Obligatorio [Guía Completa]',
    subtitle: 'Todo lo que necesitas saber para legalizar tu vivienda de uso turístico en Madrid',
    excerpt: 'Guía actualizada 2025 con todos los requisitos para obtener la licencia VUT en Madrid. Incluye checklist descargable, documentación necesaria y cómo crear el manual obligatorio.',
    content: `
# VUT Madrid 2025: Requisitos Completos para tu Licencia

Si tienes o planeas tener una **vivienda de uso turístico (VUT) en Madrid**, necesitas conocer los requisitos actualizados para 2025. La Comunidad de Madrid ha endurecido las regulaciones, y el incumplimiento puede costarte **multas de hasta 600.000€**.

## ¿Qué es una VUT en Madrid?

Una Vivienda de Uso Turístico (VUT) es aquella que se alquila de forma habitual y con fines turísticos, por periodos iguales o inferiores a 31 días.

**Requisitos básicos:**
- Cédula de habitabilidad vigente
- Certificado de eficiencia energética
- Seguro de responsabilidad civil
- Alta en el registro de la Comunidad de Madrid
- **Manual de instrucciones para huéspedes** (OBLIGATORIO desde 2024)

## Documentación Necesaria

### 1. Cédula de Habitabilidad
La vivienda debe cumplir con las condiciones mínimas de habitabilidad:
- Superficie mínima: 25m² útiles
- Altura mínima: 2,50m
- Ventilación e iluminación natural
- Instalaciones de agua, electricidad y saneamiento

### 2. Certificado Energético
Obligatorio desde 2013. Debe estar registrado en la Comunidad de Madrid y visible en todos los anuncios.

### 3. Seguro de Responsabilidad Civil
Cobertura mínima recomendada: 300.000€. Debe cubrir daños a terceros ocasionados por huéspedes.

### 4. Declaración Responsable
Desde 2019, no necesitas licencia previa. Basta con una declaración responsable ante la Comunidad de Madrid.

## El Manual Obligatorio para Huéspedes

Desde 2024, **todas las VUT en Madrid deben disponer de un manual de instrucciones** que incluya:

### Contenido Mínimo Obligatorio:
1. **Información de contacto** del propietario o gestor (disponible 24/7)
2. **Instrucciones de la vivienda** (electrodomésticos, climatización, wifi)
3. **Normas de convivencia** (ruidos, basuras, horarios)
4. **Información de seguridad** (extintores, salidas de emergencia)
5. **Servicios del edificio** (conserjería, parking, zonas comunes)
6. **Información turística** del barrio

### ¿Cómo Crear el Manual?

La forma más eficiente es usar una **plataforma digital** que:
- Permita actualizar la información al instante
- Sea accesible desde el móvil del huésped
- Incluya códigos QR para cada zona
- Registre las visualizaciones (prueba de cumplimiento)

[**Crea tu manual VUT Madrid en 10 minutos →**](https://itineramio.com/register?utm_source=blog&utm_medium=vut-madrid)

## Proceso de Registro Paso a Paso

### Paso 1: Recopilar Documentación
- DNI/NIE del titular
- Escrituras o contrato de arrendamiento
- Cédula de habitabilidad
- Certificado energético
- Póliza de seguro

### Paso 2: Declaración Responsable
Presentar en el Registro de Empresas Turísticas de la Comunidad de Madrid:
- Online: [gestiona.comunidad.madrid](https://gestiona.comunidad.madrid)
- Presencial: Con cita previa

### Paso 3: Obtener Número de Registro
Recibirás un número VT-XXXX-MAD que debe aparecer en **todos** tus anuncios.

### Paso 4: Publicar Anuncios
Incluir en Airbnb, Booking, etc.:
- Número de registro VT
- Etiqueta energética
- Capacidad máxima

## Multas por Incumplimiento

| Infracción | Sanción |
|------------|---------|
| No tener registro | 6.001€ - 60.000€ |
| Publicidad sin número registro | 601€ - 6.000€ |
| No disponer de manual | 601€ - 6.000€ |
| Superar capacidad máxima | 6.001€ - 60.000€ |
| Infracciones muy graves | 60.001€ - 600.000€ |

## Checklist VUT Madrid 2025

✅ Cédula de habitabilidad vigente
✅ Certificado energético registrado
✅ Seguro de responsabilidad civil activo
✅ Declaración responsable presentada
✅ Número de registro obtenido
✅ Manual digital para huéspedes
✅ Número de registro en todos los anuncios
✅ Libro de quejas y reclamaciones
✅ Información de contacto 24/7

## FAQ: Preguntas Frecuentes

### ¿Cuánto cuesta la licencia VUT en Madrid?
La declaración responsable es gratuita. Los costes asociados son:
- Certificado energético: 80-150€
- Seguro RC: 100-200€/año
- Manual digital: desde 9€/mes

### ¿Puedo alquilar si vivo de alquiler?
Solo con autorización expresa del propietario y si el contrato no lo prohíbe.

### ¿Qué pasa si no tengo manual?
Multa de 601€ a 6.000€, más posible suspensión de la actividad.

### ¿El manual tiene que ser en papel?
No, puede ser digital. De hecho, un manual digital con códigos QR demuestra mejor el cumplimiento.

## Conclusión

Legalizar tu VUT en Madrid es un proceso sencillo si sigues los pasos correctamente. Lo más importante:

1. **Registra tu vivienda** con la declaración responsable
2. **Incluye el número** en todos tus anuncios
3. **Crea un manual completo** para tus huéspedes
4. **Mantén actualizada** toda la documentación

**¿Necesitas crear tu manual VUT?**

Con Itineramio puedes crear un manual digital profesional en menos de 15 minutos. Incluye códigos QR por zona, analytics de uso y actualizaciones ilimitadas.

[**Prueba 15 días gratis (sin tarjeta) →**](https://itineramio.com/register?utm_source=blog&utm_medium=vut-madrid)
    `.trim(),
    coverImage: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=630&fit=crop',
    coverImageAlt: 'Vista de Madrid con edificios típicos - VUT Madrid 2025',
    category: 'NORMATIVA',
    tags: ['VUT', 'Madrid', 'licencia turística', 'requisitos', 'manual obligatorio'],
    featured: true,
    metaTitle: 'VUT Madrid 2025: Requisitos, Licencia y Manual Obligatorio | Itineramio',
    metaDescription: 'Guía completa VUT Madrid 2025: requisitos actualizados, documentación necesaria, proceso de registro y cómo crear el manual obligatorio. Checklist gratis.',
    keywords: ['vut madrid', 'licencia turistica madrid', 'vivienda uso turistico madrid', 'manual vut madrid', 'requisitos vut madrid 2025'],
    status: 'PUBLISHED',
    publishedAt: new Date(),
    authorId: 'system',
    authorName: 'Equipo Itineramio'
  },
  {
    slug: 'vut-barcelona-requisitos-2025',
    title: 'VUT Barcelona 2025: Licencia HUT, Moratoria y Requisitos [Actualizado]',
    subtitle: 'La guía más completa sobre alquiler turístico en Barcelona con la moratoria vigente',
    excerpt: 'Todo sobre las licencias HUT en Barcelona: moratoria, zonas permitidas, requisitos y alternativas legales. Actualizado con la normativa 2025.',
    content: `
# VUT Barcelona 2025: Todo Sobre la Licencia HUT

Barcelona tiene una de las **regulaciones más estrictas de España** para viviendas de uso turístico. Si planeas alquilar en la ciudad condal, necesitas entender la moratoria actual y las opciones disponibles.

## La Moratoria de Barcelona: ¿Qué Significa?

Desde 2014, Barcelona tiene una **moratoria** (suspensión) de nuevas licencias HUT (Habitatge d'Ús Turístic) en la mayoría de distritos. Esto significa:

- **No se emiten nuevas licencias** en el centro y zonas saturadas
- Las licencias existentes pueden traspasarse (con condiciones)
- Algunas zonas periféricas permiten nuevas altas
- Multas altísimas por alquiler ilegal: **hasta 600.000€**

## Zonas de Barcelona y sus Restricciones

### Zona 1 (Centro histórico)
**Ciutat Vella, Eixample, Gràcia...**
- ❌ Moratoria total: no hay nuevas licencias
- ✅ Solo traspaso de licencias existentes
- Precio licencia traspaso: 40.000€ - 150.000€

### Zona 2 (Residencial mixta)
**Sants, Les Corts, Sarrià...**
- ⚠️ Moratoria parcial
- Algunas excepciones para edificios completos

### Zona 3 (Periferia)
**Sant Andreu, Nou Barris...**
- ✅ Posibilidad de nuevas licencias
- Menor demanda turística
- Proceso más factible

### Zona 4 (Áreas específicas)
**Zonas industriales reconvertidas**
- ✅ Mayor flexibilidad
- Proyectos de regeneración urbana

## Requisitos para Licencia HUT Barcelona

Si tienes la suerte de poder solicitar licencia, necesitas:

### Documentación Obligatoria:
1. **Cédula de habitabilidad** vigente
2. **Certificado energético** (mínimo E)
3. **Acuerdo de la comunidad** de propietarios (3/5 votos)
4. **Seguro RC** mínimo 300.000€
5. **Declaración responsable** de cumplimiento
6. **Manual de instrucciones** para huéspedes

### Requisitos Técnicos:
- Superficie mínima: 40m² útiles
- 1 baño por cada 4 plazas
- Cocina equipada
- Sistema de climatización
- Conexión a internet

## El Manual Obligatorio en Barcelona

Barcelona es especialmente estricta con el manual para huéspedes. Debe incluir:

### Contenido Mínimo:
- Normas de convivencia del edificio
- Horarios de silencio (22h - 8h)
- Gestión de residuos (reciclaje obligatorio)
- Teléfono de contacto 24h
- Instrucciones de todos los aparatos
- Información de emergencias
- Plano de evacuación

### Formato Recomendado:
Un manual digital con códigos QR es la mejor opción porque:
- Demuestra cumplimiento con registro de accesos
- Permite actualizaciones instantáneas
- Los huéspedes lo consultan desde su móvil
- Reduce consultas nocturnas

[**Crea tu manual HUT Barcelona →**](https://itineramio.com/register?utm_source=blog&utm_medium=vut-barcelona)

## Multas por Alquiler Ilegal en Barcelona

Barcelona tiene las multas más altas de España:

| Infracción | Sanción |
|------------|---------|
| Alquiler sin licencia | 60.001€ - 600.000€ |
| Publicidad sin número | 3.001€ - 30.000€ |
| No disponer de manual | 3.001€ - 30.000€ |
| Superar ocupación | 6.001€ - 60.000€ |

**Importante:** Airbnb y Booking están obligados a verificar licencias y reportar anuncios ilegales.

## Alternativas Legales al HUT

Si no puedes obtener licencia HUT, existen opciones:

### 1. Alquiler de Temporada
- Contratos de 32 días a 11 meses
- Para estudiantes, trabajadores desplazados
- No requiere licencia turística
- Menos rentable pero legal

### 2. Alquiler por Habitaciones
- El propietario debe residir en la vivienda
- Máximo 2 habitaciones
- Licencia diferente (más fácil de obtener)

### 3. Aparthotel / Hotel
- Requiere cambio de uso del inmueble
- Proceso largo pero viable
- Mayor inversión inicial

### 4. Zonas Periféricas
- Municipios cercanos: Hospitalet, Badalona
- Regulaciones menos estrictas
- Buenas conexiones con Barcelona

## Traspaso de Licencias HUT

Si quieres comprar una licencia existente:

### Proceso:
1. Encontrar titular dispuesto a traspasar
2. Negociar precio (40K-150K€)
3. Contrato notarial
4. Comunicación al Ayuntamiento
5. Cambio de titularidad

### Cuidado con:
- Licencias en proceso de extinción
- Deudas asociadas a la licencia
- Incumplimientos previos del titular

## Checklist HUT Barcelona 2025

✅ Verificar zona y posibilidad de licencia
✅ Obtener cédula de habitabilidad
✅ Certificado energético (mínimo E)
✅ Acuerdo comunidad de propietarios
✅ Contratar seguro RC 300.000€
✅ Presentar declaración responsable
✅ Crear manual digital completo
✅ Número HUT visible en anuncios
✅ Placa identificativa en puerta
✅ Libro de reclamaciones disponible

## FAQ Barcelona HUT

### ¿Puedo alquilar mi piso de Barcelona sin licencia?
No. Las multas van de 60.000€ a 600.000€ y las plataformas reportan anuncios ilegales.

### ¿Cuánto cuesta una licencia HUT en traspaso?
Entre 40.000€ y 150.000€ dependiendo de la zona y características.

### ¿El Ayuntamiento puede retirar mi licencia?
Sí, por incumplimientos graves o acumulación de denuncias.

### ¿Es obligatorio el manual en catalán?
Debe estar al menos en catalán y castellano. Se recomienda también inglés.

## Conclusión

Alquilar turísticamente en Barcelona es complejo pero no imposible. Las claves:

1. **Verifica tu zona** antes de cualquier inversión
2. **Asesórate legalmente** con abogado especializado
3. **Cumple estrictamente** todos los requisitos
4. **Documenta todo** con herramientas digitales

**¿Ya tienes licencia HUT?**

Crea tu manual obligatorio con Itineramio: profesional, actualizable y con registro de cumplimiento.

[**Prueba 15 días gratis →**](https://itineramio.com/register?utm_source=blog&utm_medium=vut-barcelona)
    `.trim(),
    coverImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=630&fit=crop',
    coverImageAlt: 'Sagrada Familia Barcelona - Regulación VUT Barcelona',
    category: 'NORMATIVA',
    tags: ['HUT', 'Barcelona', 'licencia turística', 'moratoria', 'manual obligatorio'],
    featured: true,
    metaTitle: 'VUT Barcelona 2025: Licencia HUT, Moratoria y Requisitos | Itineramio',
    metaDescription: 'Guía completa HUT Barcelona 2025: moratoria, zonas permitidas, requisitos, costes de traspaso y manual obligatorio. Todo lo que necesitas saber.',
    keywords: ['hut barcelona', 'licencia turistica barcelona', 'vut barcelona', 'moratoria barcelona', 'manual hut barcelona'],
    status: 'PUBLISHED',
    publishedAt: new Date(),
    authorId: 'system',
    authorName: 'Equipo Itineramio'
  }
]

async function main() {
  console.log('🚀 Seeding VUT articles...')

  for (const article of vutArticles) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: article.slug }
    })

    if (existing) {
      console.log(`⏭️  Article already exists: ${article.slug}`)
      continue
    }

    await prisma.blogPost.create({
      data: article
    })
    console.log(`✅ Created article: ${article.title}`)
  }

  console.log('✅ VUT articles seeded successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
