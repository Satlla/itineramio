# PWA Best Practices - Itineramio

Este documento establece los patrones y mejores prácticas para desarrollar features compatibles con PWA en iOS y Android.

## Problema Principal

Cuando los usuarios añaden la app a la pantalla de inicio de iOS/Android, la app se ejecuta en modo standalone (sin barra de navegador). Esto introduce problemas específicos:

1. **Safe Area Insets**: iOS tiene áreas reservadas (notch, barra de estado, home indicator)
2. **Posicionamiento Fixed**: Los elementos fixed pueden quedar ocultos detrás de estas áreas
3. **Cookies**: Diferente comportamiento de cookies en modo PWA vs navegador
4. **Viewport**: Necesita configuración específica con `viewport-fit=cover`

## Patrones Obligatorios

### 1. Navbars Fijos

**❌ INCORRECTO:**
```tsx
<nav className="fixed top-0 left-0 right-0 bg-white">
  {/* contenido */}
</nav>
```

**✅ CORRECTO:**
```tsx
<nav
  className="fixed left-0 right-0 bg-white z-[100]"
  style={{
    top: 'env(safe-area-inset-top, 0px)'
  }}
>
  {/* contenido */}
</nav>
```

**Reglas:**
- SIEMPRE usar `z-[100]` o superior para navbars fijos
- SIEMPRE usar `style={{ top: 'env(safe-area-inset-top, 0px)' }}`
- NUNCA usar `top-0` en Tailwind para navbars
- Usar fondo OPACO (no transparente) para evitar ver contenido detrás

### 2. Contenido Debajo de Navbar

**❌ INCORRECTO:**
```tsx
<div className="pt-16">
  {/* contenido */}
</div>
```

**✅ CORRECTO:**
```tsx
<div
  className="min-h-screen bg-gray-50"
  style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}
>
  {/* contenido */}
</div>
```

**Reglas:**
- SIEMPRE añadir `paddingTop` con `calc()` que incluya `env(safe-area-inset-top)`
- El valor base (4rem) debe coincidir con la altura del navbar
- Aplicar a TODAS las páginas del dashboard

### 3. Side Menus / Modals

**❌ INCORRECTO:**
```tsx
<div className="fixed top-0 h-full">
  {/* contenido del menu */}
</div>
```

**✅ CORRECTO:**
```tsx
<div
  className="fixed top-0 h-full"
  style={{
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
  }}
>
  <div className="px-4 pt-4">
    {/* contenido del menu */}
  </div>
</div>
```

**Reglas:**
- Usar `env(safe-area-inset-top)` para top padding
- Usar `env(safe-area-inset-bottom)` para bottom padding
- NO usar `max()` a menos que necesites un mínimo específico

### 4. Cookies en PWA

**❌ INCORRECTO:**
```typescript
response.headers.set(
  'Set-Cookie',
  `token=${token}; Path=/; Max-Age=2592000`
)
```

**✅ CORRECTO:**
```typescript
const isProduction = process.env.NODE_ENV === 'production'

response.headers.set(
  'Set-Cookie',
  `token=${token}; Path=/; HttpOnly; Max-Age=2592000; SameSite=${isProduction ? 'None' : 'Lax'}${isProduction ? '; Secure' : ''}`
)
```

**Reglas:**
- SIEMPRE incluir `HttpOnly` para seguridad
- En producción: `SameSite=None; Secure`
- En desarrollo: `SameSite=Lax`
- Esto asegura que las cookies funcionen en modo PWA

## Hook Personalizado: usePWA

Usa el hook `usePWA` para detectar el entorno:

```tsx
import { usePWA } from '@/hooks/usePWA'

function MyComponent() {
  const { isPWA, isIOS, isAndroid, safeAreaInsets } = usePWA()

  return (
    <div style={{
      paddingTop: isPWA && isIOS ? safeAreaInsets.top : 0
    }}>
      {/* contenido */}
    </div>
  )
}
```

## Checklist para Nuevas Features

Antes de hacer deploy, verificar:

- [ ] ¿Hay elementos con `position: fixed`?
  - [ ] ¿Usan `env(safe-area-inset-*)`?
  - [ ] ¿Tienen z-index adecuado (≥100 para navbars)?

- [ ] ¿Hay contenido que pueda quedar oculto detrás de navbar?
  - [ ] ¿Se aplicó padding-top con calc()?

- [ ] ¿Se crean/modifican cookies?
  - [ ] ¿Tienen HttpOnly?
  - [ ] ¿Tienen SameSite correcto?

- [ ] ¿Se probó en PWA mode?
  - [ ] iOS Safari (Add to Home Screen)
  - [ ] Android Chrome (Install App)

## Archivos de Configuración Críticos

### public/manifest.json
```json
{
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"],
  "orientation": "portrait-primary"
}
```

### app/layout.tsx
```tsx
viewport: {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' // CRÍTICO para safe-area
}
```

### app/globals.css
```css
:root {
  /* Variables para consistencia */
  --navbar-height: 4rem;
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
}

@supports (padding: env(safe-area-inset-top)) {
  body {
    padding-top: var(--safe-area-top);
    padding-bottom: var(--safe-area-bottom);
  }
}
```

## Debugging PWA Issues

### iOS Safari
1. Añadir app a pantalla de inicio
2. Abrir la app
3. Conectar iPhone a Mac
4. Safari > Develop > [iPhone] > [App Name]
5. Usar inspector para ver console.log y elementos

### Android Chrome
1. Instalar app (banner o menú)
2. Abrir la app
3. Chrome en desktop > chrome://inspect
4. Seleccionar el dispositivo
5. Click "inspect" en la app

### Herramientas Útiles

```javascript
// En console del navegador:
console.log({
  isPWA: window.matchMedia('(display-mode: standalone)').matches,
  safeAreaTop: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-top'),
  userAgent: navigator.userAgent,
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
})
```

## Recursos Adicionales

- [MDN: Safe Area Insets](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [Apple: Designing for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [Google: Install criteria](https://web.dev/articles/install-criteria)

## Responsable

Este documento debe actualizarse cuando se descubran nuevos patrones o problemas relacionados con PWA.

Última actualización: Noviembre 2025
