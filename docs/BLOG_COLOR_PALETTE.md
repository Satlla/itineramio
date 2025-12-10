# Paleta de Colores del Blog - Itineramio

## Colores Principales

### Texto
- **Títulos principales (H2)**: `#1f2937` (Gray 800)
- **Títulos secundarios (H3)**: `#374151` (Gray 700)
- **Texto cuerpo**: `#4b5563` (Gray 600)
- **Texto secundario**: `#6b7280` (Gray 500)

### Fondos
- **Fondo principal bloques**: `#f9fafb` (Gray 50)
- **Fondo tarjetas**: `#ffffff` (White)
- **Fondo destacado**: `#1f2937` (Gray 800)

### Bordes y Acentos
- **Borde principal**: `#e5e7eb` (Gray 200)
- **Borde acento**: `#6b7280` (Gray 500)
- **Enlaces**: `#6366f1` (Indigo 500)

### Estados Semánticos (uso limitado)
- **Success**: `#059669` (Green 600) - Solo para checkmarks
- **Error/Warning**: `#ef4444` (Red 500) - Solo para alertas críticas
- **Info**: `#fef3c7` (Amber 100) - Fondos de notas

## Reglas de Uso

1. **Máximo 3 colores por sección** (sin contar texto)
2. **Gradientes prohibidos** - Usar colores sólidos
3. **Banners CTA**: Solo usar `#1f2937` con texto blanco
4. **Alertas/Warning**: Solo usar color cuando sea crítico
5. **Mantener alto contraste** para accesibilidad

## Ejemplos de Bloques

### Bloque de Contenido Normal
```html
<div style="background-color: #f9fafb; border-radius: 16px; padding: 2.5rem; border-left: 4px solid #6b7280;">
  <h3 style="color: #1f2937;">Título</h3>
  <p style="color: #4b5563;">Contenido</p>
</div>
```

### Banner CTA
```html
<div style="background-color: #1f2937; border-radius: 16px; padding: 3rem; text-align: center; color: white;">
  <h3 style="color: white;">CTA Title</h3>
  <a href="/register" style="background-color: white; color: #1f2937;">Button</a>
</div>
```

### Alerta Crítica
```html
<div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 16px; padding: 2rem;">
  <p style="color: #991b1b;">Mensaje de error</p>
</div>
```
