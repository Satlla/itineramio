# Checklist: Implementación de Enlaces Internos

## Pre-Ejecución

### 1. Backup
- [ ] Hacer backup de la base de datos
  ```bash
  npx tsx scripts/backup-database.ts
  ```
- [ ] Verificar que el backup se completó exitosamente
- [ ] Guardar backup en ubicación segura

### 2. Verificación del Entorno
- [ ] Verificar que estás en la rama correcta (`main` o `development`)
  ```bash
  git branch
  ```
- [ ] Verificar que no hay cambios sin commitear
  ```bash
  git status
  ```
- [ ] Verificar dependencias instaladas
  ```bash
  npm list @prisma/client cheerio
  ```

### 3. Preview del Script
- [ ] Ejecutar el preview para ver qué cambios se harán
  ```bash
  npx tsx scripts/preview-internal-links.ts
  ```
- [ ] Revisar el resumen del preview
- [ ] Verificar que los artículos fuente existen
- [ ] Verificar que los textos de búsqueda son correctos

### 4. Revisión de Configuración
- [ ] Abrir `scripts/add-internal-links.ts`
- [ ] Revisar el array `linkPlacements`
- [ ] Verificar que los slugs son correctos
- [ ] Verificar que los títulos son correctos
- [ ] Verificar que `LINK_COLOR` es `#6366f1`

---

## Ejecución

### 5. Ejecutar el Script
- [ ] Ejecutar el script principal
  ```bash
  npx tsx scripts/add-internal-links.ts
  ```
- [ ] Esperar a que termine (debería tomar 5-10 segundos)
- [ ] Verificar que no hay errores en el output
- [ ] Verificar el resumen final:
  - Enlaces agregados: 13-15 (esperado)
  - Artículos modificados: 13-15 (esperado)
  - Errores: 0 (esperado)

### 6. Captura del Output
- [ ] Copiar el output completo del script
- [ ] Guardar en un archivo de texto para referencia
- [ ] Tomar screenshot del resumen final

---

## Post-Ejecución

### 7. Verificación en Base de Datos
- [ ] Ejecutar análisis de enlaces
  ```bash
  npx tsx scripts/analyze-blog-links.ts
  ```
- [ ] Verificar que los 5 artículos huérfanos ahora tienen enlaces entrantes
- [ ] Verificar que no hay enlaces rotos nuevos

### 8. Verificación Manual de Artículos

#### Artículo 1: Del Modo Bombero al Modo CEO
- [ ] Visitar: `/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa`
- [ ] Buscar el enlace "dejó de apagar fuegos"
- [ ] Verificar que el enlace funciona
- [ ] Verificar que el color es `#6366f1`

#### Artículo 2: Automatización Airbnb: Recupera 8 Horas
- [ ] Visitar: `/blog/mensajes-automaticos-airbnb`
- [ ] Buscar el enlace "automatización completa"
- [ ] Verificar que el enlace funciona
- [ ] Verificar que el color es correcto

#### Artículo 3: RevPAR vs Ocupación
- [ ] Visitar: `/blog/como-optimizar-precio-apartamento-turistico-2025`
- [ ] Buscar el enlace "métrica más importante"
- [ ] Verificar que el enlace funciona
- [ ] Verificar que el color es correcto

#### Artículo 4: Metodología y Fuentes
- [ ] Visitar: `/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa`
- [ ] Buscar el enlace "datos del sector"
- [ ] Verificar que el enlace funciona
- [ ] Verificar que el color es correcto

#### Artículo 5: Automatización Anfitriones
- [ ] Visitar: `/blog/mensajes-automaticos-booking`
- [ ] Buscar el enlace "sistemas automatizados"
- [ ] Verificar que el enlace funciona
- [ ] Verificar que el color es correcto

### 9. Pruebas de Navegación
- [ ] Hacer clic en cada nuevo enlace
- [ ] Verificar que llega a la página correcta
- [ ] Verificar que no hay errores 404
- [ ] Verificar que el estilo del enlace es consistente
- [ ] Verificar que el enlace es visible (no oculto por CSS)

### 10. Pruebas en Diferentes Dispositivos
- [ ] Verificar en desktop (Chrome/Firefox/Safari)
- [ ] Verificar en mobile (responsive)
- [ ] Verificar en tablet
- [ ] Verificar que los enlaces son clickeables en mobile

---

## Configuración de Tracking

### 11. Google Analytics
- [ ] Ir a Google Analytics → Eventos
- [ ] Configurar evento personalizado para clics en enlaces internos (opcional)
- [ ] Crear marcador para fecha de implementación
- [ ] Capturar métricas baseline (antes):
  - Vistas por artículo huérfano
  - Tasa de rebote promedio
  - Páginas por sesión

### 12. Google Search Console
- [ ] Ir a Rendimiento
- [ ] Filtrar por los 5 URLs de artículos huérfanos
- [ ] Capturar métricas baseline:
  - Impresiones
  - Clics
  - CTR
  - Posición promedio

---

## Monitoreo (Primeras 24 horas)

### 13. Verificación de Errores
- [ ] Revisar logs del servidor (si hay acceso)
- [ ] Buscar errores 404 relacionados con los nuevos enlaces
- [ ] Verificar que no hay quejas de usuarios
- [ ] Revisar métricas de error en Google Analytics

### 14. Métricas Iniciales
- [ ] Capturar vistas de artículos huérfanos (primeras 24h)
- [ ] Comparar con vistas del día anterior
- [ ] Verificar si hay clics en los nuevos enlaces
- [ ] Verificar tasa de rebote

---

## Monitoreo (Primera Semana)

### 15. Análisis Semanal - Día 7
- [ ] Vistas por artículo huérfano (objetivo: +20%)
  - Artículo 1: _____ vistas (antes: 9)
  - Artículo 2: _____ vistas (antes: 9)
  - Artículo 3: _____ vistas (antes: 8)
  - Artículo 4: _____ vistas (antes: 8)
  - Artículo 5: _____ vistas (antes: 0)

- [ ] Métricas generales:
  - Páginas por sesión: _____ (baseline: _____)
  - Tasa de rebote: _____ (baseline: _____)
  - Tiempo en sitio: _____ (baseline: _____)

### 16. Identificar Problemas
- [ ] ¿Algún artículo sin aumento de vistas?
- [ ] ¿Hay enlaces que no reciben clics?
- [ ] ¿Tasa de rebote aumentó en algún artículo?
- [ ] ¿Hay quejas o feedback negativo?

---

## Optimización (Si es necesario)

### 17. Ajustes Post-Implementación
Si algún artículo no está funcionando:

- [ ] Revisar el anchor text (¿es lo suficientemente atractivo?)
- [ ] Revisar el contexto (¿el enlace tiene sentido?)
- [ ] Considerar agregar más enlaces desde otros artículos
- [ ] Considerar mover el enlace a una posición más prominente

### 18. Expansión
Si los resultados son positivos:

- [ ] Identificar siguiente grupo de artículos huérfanos
- [ ] Preparar segunda fase de enlaces internos
- [ ] Considerar crear hub articles (artículos pilares)
- [ ] Documentar lecciones aprendidas

---

## Reporte Final (30 días)

### 19. Análisis de Resultados - Día 30
- [ ] Crear reporte comparativo:
  ```
  Antes → Después

  Artículo 1: 9 vistas → _____ vistas (+___%)
  Artículo 2: 9 vistas → _____ vistas (+___%)
  Artículo 3: 8 vistas → _____ vistas (+___%)
  Artículo 4: 8 vistas → _____ vistas (+___%)
  Artículo 5: 0 vistas → _____ vistas (+___%)

  Total: 34 vistas → _____ vistas (+___%)
  ```

- [ ] Métricas de engagement:
  - CTR de enlaces internos: _____%
  - Páginas por sesión: _____ (+/- ___%)
  - Tasa de rebote: _____ (+/- ___%)
  - Tiempo en sitio: _____ (+/- ___%)

### 20. Documentación
- [ ] Actualizar este checklist con hallazgos
- [ ] Documentar qué funcionó y qué no
- [ ] Compartir resultados con el equipo
- [ ] Planificar siguiente fase

---

## Rollback (Si es necesario)

### 21. Plan de Contingencia
Solo ejecutar si hay problemas graves:

- [ ] Identificar el problema específico
- [ ] Restaurar backup de base de datos
  ```bash
  # Comandos específicos según tu sistema de backup
  ```
- [ ] Verificar que la restauración fue exitosa
- [ ] Documentar el problema para evitarlo en el futuro

---

## Notas y Observaciones

### Problemas Encontrados
```
Fecha: ____________
Problema: _______________________________________________
Solución: _______________________________________________
```

### Hallazgos Positivos
```
Fecha: ____________
Hallazgo: _______________________________________________
Impacto: ________________________________________________
```

### Ideas para Futuro
```
- _____________________________________________________
- _____________________________________________________
- _____________________________________________________
```

---

## Firma y Aprobación

- **Ejecutado por**: ___________________
- **Fecha de ejecución**: ___________________
- **Hora de ejecución**: ___________________
- **Resultados**: ☐ Exitoso  ☐ Con problemas  ☐ Fallido
- **Requiere seguimiento**: ☐ Sí  ☐ No
- **Próxima revisión**: ___________________

---

## Referencias Rápidas

### Scripts Útiles
```bash
# Preview (sin cambios)
npx tsx scripts/preview-internal-links.ts

# Ejecutar (con cambios)
npx tsx scripts/add-internal-links.ts

# Analizar enlaces
npx tsx scripts/analyze-blog-links.ts

# Listar todos los artículos
npx tsx scripts/list-all-blog-articles.ts

# Backup
npx tsx scripts/backup-database.ts
```

### URLs de Artículos Huérfanos
```
1. https://itineramio.com/blog/del-modo-bombero-al-modo-ceo-framework
2. https://itineramio.com/blog/automatizacion-airbnb-recupera-8-horas-semanales
3. https://itineramio.com/blog/revpar-vs-ocupacion-metrica-que-cambia-todo
4. https://itineramio.com/blog/metodologia-fuentes-datos-itineramio
5. https://itineramio.com/blog/automatizacion-anfitriones-airbnb
```

### Contactos
```
- Desarrollo: ___________________
- SEO: ___________________
- Contenido: ___________________
```

---

**Versión**: 1.0
**Última actualización**: 2024-12-11
**Próxima revisión**: 2024-01-11
