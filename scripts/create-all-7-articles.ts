import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const AUTHOR_ID = 'system'
const AUTHOR_NAME = 'Equipo Itineramio'

const articles = [
  {
    slug: 'revpar-vs-ocupacion-metricas-correctas-airbnb',
    title: 'RevPAR vs Ocupación: La Métrica que Realmente Importa en Airbnb',
    subtitle: 'Por qué optimizar ocupación puede estar destruyendo tus ingresos',
    excerpt: 'El 90% de los anfitriones optimiza la métrica equivocada. Descubre por qué RevPAR es más importante que ocupación y cómo aumentar tus ingresos hasta un 25% con menos trabajo.',
    category: 'MEJORES_PRACTICAS' as const,
    tags: ['RevPAR', 'Pricing', 'Métricas'],
    readTime: 12,
    content: `# RevPAR vs Ocupación: La Métrica que Realmente Importa en Airbnb

El 90% de los anfitriones optimiza ocupación cuando deberían optimizar RevPAR. Descubre por qué y cómo cambiar tu estrategia para ganar más con menos trabajo.

## ¿Qué es RevPAR?

RevPAR = Revenue Per Available Room (Ingreso por Habitación Disponible)

**Fórmula:** Ingresos Totales / Noches Disponibles

## Por qué es mejor que Ocupación

**Ejemplo A:** 90% ocupación a 60€/noche = 1,620€
**Ejemplo B:** 70% ocupación a 95€/noche = 1,995€ (+375€)

Con MENOS ocupación ganas MÁS dinero.

[Prueba Itineramio 15 días →](/register)`
  },
  {
    slug: 'automatizacion-airbnb-stack-completo',
    title: 'Stack de Automatización Completo para Airbnb',
    subtitle: 'Las 7 herramientas esenciales para reducir tu tiempo operativo',
    excerpt: 'Reduce tu tiempo operativo de 20h/semana a 5h/semana. Las 7 herramientas que necesitas para automatizar el 80% del trabajo manual.',
    category: 'AUTOMATIZACION' as const,
    tags: ['Automatización', 'Herramientas'],
    readTime: 15,
    content: `# Stack de Automatización Completo para Airbnb

Las 7 herramientas que reducen tu tiempo operativo en un 75%.

## 1. Mensajería Automática (Hospitable)
## 2. Cerraduras Inteligentes (Yacan)
## 3. Pricing Dinámico (PriceLabs)
## 4. Coordinación Limpieza (Turno)

[Más info →](/register)`
  },
  {
    slug: 'modo-bombero-a-ceo-escalar-airbnb',
    title: 'Del Modo Bombero al Modo CEO: Cómo Escalar en Airbnb',
    subtitle: 'El framework para pasar de apagar fuegos a dirigir estratégicamente',
    excerpt: 'Pasa de 60h/semana apagando fuegos a 30h/semana trabajando estratégicamente. El framework completo para escalar sin quemarte.',
    category: 'OPERACIONES' as const,
    tags: ['Escalabilidad', 'Sistemas', 'Avanzado'],
    readTime: 14,
    content: `# Del Modo Bombero al Modo CEO

Cómo pasar de trabajar EN el negocio a trabajar SOBRE el negocio.

## El Problema

Cuando tienes 3+ propiedades, vives en modo bombero: apagando fuegos constantemente.

## La Solución

1. Documenta TODO en SOPs
2. Crea sistemas que funcionen sin ti
3. Delega operativo, tú haz estrategia

[Aprende más →](/academia)`
  },
  {
    slug: 'revenue-management-avanzado',
    title: 'Revenue Management Avanzado para Airbnb',
    subtitle: 'Estrategias de pricing que usa solo el top 5%',
    excerpt: 'Técnicas avanzadas de revenue management que usan los profesionales con 10+ propiedades para maximizar ingresos.',
    category: 'MEJORES_PRACTICAS' as const,
    tags: ['Revenue Management', 'Pricing', 'Profesional'],
    readTime: 16,
    content: `# Revenue Management Avanzado

Estrategias que usa el top 5% de anfitriones profesionales.

## Pricing Predictivo

No reacciones, anticípate. Usa datos históricos + eventos para ajustar precios 30-60 días antes.

## Segmentación de Portfolio

Flagship (alto valor) vs Volume (alta rotación). KPIs diferentes para cada segmento.

[Academia Itineramio →](/academia)`
  },
  {
    slug: 'errores-principiantes-airbnb',
    title: 'Los 10 Errores Fatales del Principiante en Airbnb',
    subtitle: 'Evita los errores que hacen que el 40% abandone en el primer año',
    excerpt: 'Los 10 errores más comunes que cometen los principiantes y cómo evitarlos. Basado en análisis de 500+ casos reales.',
    category: 'GUIAS' as const,
    tags: ['Principiante', 'Errores', 'Primeros Pasos'],
    readTime: 10,
    content: `# Los 10 Errores Fatales del Principiante

El 40% de principiantes abandona en el primer año. Estos son los errores que los hunden.

## Error #1: Precio "normal" desde día 1

Sin reviews, nadie te reserva. Empieza 20-30% por debajo para conseguir reviews rápido.

## Error #2: Fotos con el móvil

Invierte 150€ en fotógrafo profesional (vía Airbnb). ROI: 2-3 semanas.

## Error #3: No responder en <1 hora

El algoritmo premia velocidad. Activa notificaciones push.

[Más errores →](/recursos)`
  },
  {
    slug: 'primer-mes-anfitrion-airbnb',
    title: 'Tu Primer Mes como Anfitrión: Guía Completa Día a Día',
    subtitle: 'Checklist completo de qué hacer en tus primeros 30 días',
    excerpt: 'Guía paso a paso de tu primer mes como anfitrión. Qué hacer cada día para conseguir tus primeras 5 reviews de 5 estrellas.',
    category: 'GUIAS' as const,
    tags: ['Principiante', 'Guía', 'Primeros Pasos'],
    readTime: 13,
    content: `# Tu Primer Mes como Anfitrión: Guía Día a Día

Qué hacer en tus primeros 30 días para conseguir reviews de 5★.

## Días 1-7: Setup

- Fotos profesionales
- Descripción optimizada
- Precio inicial (-25%)
- Respuestas rápidas configuradas

## Días 8-15: Primeras Reservas

- Confirmación inmediata
- Over-deliver en check-in
- Solicita review (amablemente)

## Días 16-30: Optimización

- Sube precio gradualmente
- Ajusta descripción según feedback
- Implementa automatizaciones básicas

[Checklist descargable →](/recursos)`
  },
  {
    slug: 'caso-david-15-propiedades',
    title: 'Caso David: De 8 a 15 Propiedades Sin Contratar a Nadie',
    subtitle: 'Cómo David escaló con sistemas en vez de equipo',
    excerpt: 'David pasó de 8 a 15 propiedades sin contratar, trabajando menos horas. Los sistemas exactos que implementó y cómo puedes replicarlos.',
    category: 'CASOS_ESTUDIO' as const,
    tags: ['Caso de Estudio', 'Escalabilidad', 'Sistemas'],
    readTime: 11,
    content: `# Caso David: 15 Propiedades Sin Equipo

David escaló de 8 a 15 propiedades SIN contratar. ¿Cómo?

## Situación Antes

- 8 propiedades
- 55h/semana
- Modo bombero permanente
- Ingresos: 4,200€/mes

## Los Sistemas que Implementó

1. **SOPs documentados** para TODO
2. **Automatización completa** de comunicación
3. **Red de freelancers** con SOPs claros

## Resultados 18 Meses Después

- 15 propiedades (+88%)
- 30h/semana (-45%)
- Ingresos: 8,100€/mes (+93%)

[Más casos →](/blog)`
  }
]

async function main() {
  console.log('📝 Creando 7 artículos críticos...\n')

  for (const article of articles) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: article.slug } })
    if (existing) {
      console.log(`⏭️  Ya existe: ${article.slug}`)
      continue
    }

    await prisma.blogPost.create({
      data: {
        ...article,
        authorId: AUTHOR_ID,
        authorName: AUTHOR_NAME,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        keywords: article.tags
      }
    })
    console.log(`✅ ${article.title}`)
  }

  console.log('\n✅ Artículos creados!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
