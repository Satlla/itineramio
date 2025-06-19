# URLs Amigables - Guía de Implementación

## 🎯 Objetivo

Convertir las URLs crípticas como:
```
/properties/cmbyxou310001jv04bhfb0hy0/zones/cmbyxp8ub0001gz045cgvmlyb
```

En URLs amigables como:
```
/properties/mi-apartamento-madrid/wifi
/properties/casa-de-playa-valencia/cocina
```

## 📁 Estructura Implementada

### Nuevas Rutas
- `/properties/[propertySlug]/page.tsx` - Vista principal de propiedad
- `/properties/[propertySlug]/[zoneSlug]/page.tsx` - Vista de zona específica

### Utilidades
- `src/lib/slugs.ts` - Funciones para generar y manejar slugs

## 🔧 Funciones Principales

### `createSlug(text: string)`
Convierte texto a URL amigable:
```typescript
createSlug("Mi Apartamento en Madrid") // → "mi-apartamento-en-madrid"
createSlug("Cocina & Electrodomésticos") // → "cocina-electrodomesticos"
```

### `createPropertySlug(property)`
Genera slug para propiedades:
```typescript
// Con ciudad
createPropertySlug({
  name: "Apartamento Centro",
  city: "Madrid"
}) // → "apartamento-centro-madrid"

// Sin ciudad
createPropertySlug({
  name: "Casa de Campo"
}) // → "casa-de-campo"
```

### `createZoneSlug(zone)`
Genera slug para zonas:
```typescript
createZoneSlug({
  name: "WiFi & Internet"
}) // → "wifi-internet"
```

### `createFriendlyUrl(property, zone?)`
Genera URL completa:
```typescript
// Solo propiedad
createFriendlyUrl(property) // → "/properties/mi-apartamento-madrid"

// Propiedad + zona
createFriendlyUrl(property, zone) // → "/properties/mi-apartamento-madrid/wifi"
```

## 🔍 Funciones de Búsqueda

### `findPropertyBySlug(slug, properties)`
Busca propiedad por slug:
```typescript
const property = findPropertyBySlug("mi-apartamento-madrid", allProperties)
```

### `findZoneBySlug(slug, zones)`
Busca zona por slug:
```typescript
const zone = findZoneBySlug("wifi", propertyZones)
```

## 🌐 Manejo de Multiidioma

Las funciones manejan automáticamente objetos multiidioma:
```typescript
// Entrada
{
  name: { es: "Mi Apartamento", en: "My Apartment", fr: "Mon Appartement" },
  city: { es: "Madrid", en: "Madrid", fr: "Madrid" }
}

// Salida
"mi-apartamento-madrid"
```

Prioridad de idiomas: `es` → `en` → `fr` → fallback

## 📊 Compatibilidad

### URLs Actuales (siguen funcionando)
- `/properties/[id]/page.tsx`
- `/properties/[id]/zones/[zoneId]/page.tsx`

### URLs Nuevas
- `/properties/[propertySlug]/page.tsx`
- `/properties/[propertySlug]/[zoneSlug]/page.tsx`

## 🔄 Migración Gradual

1. **Fase 1** ✅ - URLs nuevas coexisten con las antiguas
2. **Fase 2** - Actualizar todos los enlaces internos
3. **Fase 3** - Agregar redirects automáticos
4. **Fase 4** - Deprecar URLs antiguas

## 🛠 Implementación

### En Componentes
```typescript
import { createFriendlyUrl, createPropertySlug } from '../../../src/lib/slugs'

// Navegación a propiedad
const propertyUrl = createPropertySlug(property)
router.push(`/properties/${propertyUrl}`)

// Navegación a zona
const fullUrl = createFriendlyUrl(property, zone)
router.push(fullUrl)
```

### En APIs
```typescript
// Buscar por slug en lugar de ID
const property = findPropertyBySlug(params.propertySlug, allProperties)
if (!property) {
  return NextResponse.json({ error: 'Property not found' }, { status: 404 })
}

// Usar el ID real para consultas de base de datos
const zones = await prisma.zone.findMany({
  where: { propertyId: property.id }
})
```

## 📈 Beneficios

1. **SEO Mejorado** - URLs descriptivas
2. **UX Mejor** - URLs comprensibles
3. **Branding** - URLs profesionales
4. **Compatibilidad** - Sin romper enlaces existentes

## 🔗 Ejemplos Reales

### Antes
```
/properties/cmbyxou310001jv04bhfb0hy0
/properties/cmbyxou310001jv04bhfb0hy0/zones/cmbyxp8ub0001gz045cgvmlyb
```

### Después
```
/properties/apartamento-centro-madrid
/properties/apartamento-centro-madrid/wifi
/properties/casa-playa-valencia/cocina
/properties/chalet-sierra-madrid/piscina
```

## ⚠️ Notas Importantes

1. Los slugs se generan automáticamente al crear propiedades/zonas
2. Si una propiedad cambia de nombre, el slug anterior sigue funcionando
3. Los caracteres especiales se normalizan automáticamente
4. Los espacios se convierten en guiones
5. Todo se convierte a minúsculas

## 🧪 Testing

```bash
# Compilar y verificar
npm run build

# Probar URLs
/properties/mi-apartamento-madrid
/properties/mi-apartamento-madrid/wifi
```