# Debug: Banner de Bienvenida no aparece en Mobile

## Ubicación de archivos relevantes:

### 1. Modal de Bienvenida Principal
- **Archivo**: `/app/(dashboard)/properties/[id]/zones/page.tsx`
- **Componente**: `ZonasEsencialesModal`
- **Lineas**: 296-349

### 2. Componente del Modal
- **Archivo**: `/src/components/ui/ZonasEsencialesModal.tsx`
- **CSS responsivo**: Usa clases Tailwind como `max-w-6xl lg:max-w-5xl`

## Lógica de detección para mostrar el banner:

```javascript
// Condiciones que deben cumplirse TODAS para mostrar el banner:
const hasExistingZones = transformedZones.length > 0
const propertyZonesKey = `property_${id}_zones_created`
const hasCreatedZonesForThisProperty = isClient && typeof window !== 'undefined' ? 
  !!window.localStorage.getItem(propertyZonesKey) : false

if (isClient && !hasExistingZones && !hasCreatedZonesForThisProperty) {
  const propertyWelcomeKey = `property_${id}_welcome_shown`
  const hasShownWelcome = typeof window !== 'undefined' ? 
    !!window.localStorage.getItem(propertyWelcomeKey) : false
  
  if (!hasShownWelcome) {
    setShowZonasEsencialesModal(true) // <-- Aquí se muestra el modal
  }
}
```

## Claves de localStorage utilizadas:
- `property_${propertyId}_zones_created` - Marca si ya se crearon zonas para esa propiedad
- `property_${propertyId}_welcome_shown` - Marca si ya se mostró el mensaje de bienvenida

## Posibles causas del problema en móvil:

1. **JavaScript deshabilitado o errores**: El estado `isClient` no se establece correctamente
2. **localStorage no disponible**: Problemas con localStorage en móvil
3. **CSS ocultando el modal**: Z-index o problemas de responsive
4. **Condiciones no cumplidas**: Alguna de las condiciones falla específicamente en móvil

## CSS del modal (responsive):
```jsx
className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
// Modal container:
className="bg-white rounded-xl p-6 w-full max-w-6xl lg:max-w-5xl max-h-[95vh] overflow-y-auto my-4"
```

## Tests necesarios:

1. Verificar que `isClient` se establece a `true` en móvil
2. Verificar que localStorage funciona en móvil
3. Verificar que las condiciones se cumplen en móvil
4. Verificar que no hay conflictos de CSS/z-index