# SEO Content Architecture — Itineramio

Documento de referencia para la estrategia de contenido SEO.
Actualizado: 18 abril 2026.

---

## Estructura de URLs

```
/                                    → Landing principal (manuales digitales)
/gestion-alquiler-vacacional         → Landing módulo gestión/facturación
/pricing                             → Precios
/funcionalidades                     → Funcionalidades
/demo                                → Demo

/normativa/                          → Índice normativa CCAA
/normativa/[ccaa]                    → 6 CCAA (madrid, cataluna, comunitat-valenciana, andalucia, canarias, baleares)

/comparar/                           → Índice comparativas
/comparar/itineramio-vs-[competidor] → 6 comparativas (touch-stay, hospitable, hostfully, smoobu, guesty, yourwelcome)

/guia/[slug]                         → Guías problema-solución (código, JSON-LD HowTo)
/blog/[slug]                         → Blog posts (BD, admin)
/blog/categoria/[categoria]          → Categorías del blog

/[ciudad]                            → Landings de ciudad (código, CityLandingPage component)
```

## Componentes reutilizables

| Componente | Ruta | Usado por |
|---|---|---|
| CityLandingPage | src/components/landing/CityLandingPage.tsx | 20 landings de ciudad |
| NormativaPage | src/components/landing/NormativaPage.tsx | 6 páginas de normativa |

## Ciudades

### Tier 1 (10)
madrid, barcelona, valencia, sevilla, malaga, alicante, palma-de-mallorca, las-palmas, tenerife-sur, granada

### Tier 2 (10)
marbella, benidorm, ibiza, cadiz, san-sebastian, tarragona, torrevieja, menorca, santander, a-coruna

## Normativa CCAA

| CCAA | Slug | Ley principal |
|---|---|---|
| Comunidad de Madrid | madrid | Decreto 79/2014 |
| Cataluña | cataluna | Llei 13/2002, PEUAT |
| Comunitat Valenciana | comunitat-valenciana | Ley 15/2018, límite 10 días |
| Andalucía | andalucia | Decreto 28/2016 |
| Canarias | canarias | Decreto 113/2015, Ley 6/2025 |
| Islas Baleares | baleares | Ley 8/2012, plazas, ITS |

### Pendientes
- País Vasco (San Sebastián)
- Cantabria (Santander)
- Galicia (A Coruña)

## Comparativas

| Competidor | Slug | Ángulo |
|---|---|---|
| Touch Stay | touch-stay | Competidor directo manuales |
| Hospitable | hospitable | PMS completo vs manuales |
| Hostfully | hostfully | Guidebooks + PMS |
| Smoobu | smoobu | Channel manager español |
| Guesty | guesty | Enterprise 200+ props |
| YourWelcome | yourwelcome | Tablet física vs web/QR |

## Guías (código)

| Slug | Keyword principal | Schema |
|---|---|---|
| como-reducir-llamadas-huespedes | reducir llamadas huespedes airbnb | HowTo |
| como-registrar-viajeros-ses-hospedajes | SES hospedajes tutorial | HowTo |
| como-hacer-check-in-automatico-airbnb | check-in automatico airbnb | HowTo |
| como-conseguir-superhost-airbnb | como conseguir superhost airbnb | HowTo |
| como-crear-manual-bienvenida-apartamento | manual bienvenida apartamento | HowTo |
| fiscalidad-alquiler-turistico | fiscalidad alquiler turistico | HowTo (PILAR) |

## Cluster Fiscalidad (blog posts en BD)

Hub pilar: `/guia/fiscalidad-alquiler-turistico` (código)
Posts del cluster (admin/BD, categoría NORMATIVA):

| # | Slug | Keyword | Target |
|---|---|---|---|
| 1 | factura-huesped-airbnb-obligatorio | factura huesped airbnb | Propietario |
| 2 | declarar-ingresos-airbnb-bruto-neto | declarar ingresos airbnb | Propietario |
| 3 | iva-alquiler-turistico-10-o-21 | iva alquiler turistico | Propietario |
| 4 | alquiler-turistico-autonomo-obligatorio | autonomo airbnb | Propietario |
| 5 | retencion-irpf-alquiler-turistico | irpf alquiler turistico | Propietario/Gestor |
| 6 | factura-comision-gestor-propietario | factura comision gestor | Gestor |
| 7 | verifactu-gestores-alquiler-vacacional | verifactu alquiler turistico | Gestor |

## Sitemap

Gestionado en `app/sitemap.ts`. Incluye:
- staticRoutes (páginas fijas)
- cityRoutes (20 ciudades)
- guiaRoutes (5+1 guías)
- normativaRoutes (7 páginas)
- hubToolsRoutes (herramientas + comparativas + recursos)
- categoryRoutes (categorías blog)
- blogPostRoutes (dinámico desde BD)

## Robots.txt

Archivo: `public/robots.txt`
- Bloqueado: /_next/, /admin/, /api/, /gestion/, /onboarding/, /preview/, rutas de test
- Permitido: /, /blog/, /hub/, /comparar/, /normativa/, /guia/, /funcionalidades
