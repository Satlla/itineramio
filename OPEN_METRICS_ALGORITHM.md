# ALGORITMO ABIERTO DE MÉTRICAS - ITINERAMIO
## Sistema de Tracking y Valoración de Interacciones

---

## 📊 MÉTRICAS PRINCIPALES

### 1. Zonas Vistas (Steps Views)
**Descripción**: Contador que incrementa cada vez que un huésped visualiza un paso dentro de una zona.

**Triggers**:
- Usuario hace click en "Siguiente" en cualquier paso
- Usuario navega directamente a un paso específico
- Usuario completa todos los pasos de una zona

**Valor**: +1 por cada paso visto

---

### 2. Zonas Completadas (Zone Completions)
**Descripción**: Cuando un huésped termina de ver TODOS los pasos de una zona específica.

**Triggers**:
- Usuario llega al último paso y hace click en "Finalizar"
- Se muestra popup de valoración

**Valor**: +1 por zona completada

**Impacto en Tiempo Ahorrado**:
- Check-in/Check-out: 15 minutos ahorrados
- WiFi/Contraseñas: 8 minutos ahorrados
- Electrodomésticos: 12 minutos ahorrados
- Parking/Transporte: 10 minutos ahorrados
- Emergencias: 20 minutos ahorrados

---

### 3. Valoraciones (Ratings)
**Descripción**: Feedback del huésped sobre la utilidad de la información.

**Trigger**: Al completar todos los pasos de una zona, aparece popup:
```
"¿Te ha resultado útil la información?"
⭐⭐⭐⭐⭐ (1-5 estrellas)
[Campo de texto opcional para comentario]
```

**Datos almacenados**:
- Rating (1-5)
- Comentario (opcional)
- Zona valorada
- Propiedad
- Timestamp
- ID anónimo del huésped

---

### 4. Reportes Técnicos
**Descripción**: Problemas reportados por huéspedes sobre elementos de la propiedad.

**Trigger**: Botón "Reportar problema" en cada zona

**Datos**:
- Descripción del problema
- Zona afectada
- Urgencia (Alta/Media/Baja)
- Foto opcional
- Timestamp

---

## 🔄 FLUJO DE INTERACCIÓN

### Vista de Zona Pública
1. **Entrada**: Huésped accede a `/guide/[propertyId]/[zoneId]`
2. **Navegación por pasos**:
   - Click "Siguiente" → +1 Vista de Paso
   - Click "Anterior" → No cuenta
   - Salir sin completar → Se guardan vistas parciales
3. **Finalización**:
   - Último paso + "Finalizar" → +1 Zona Completada
   - Aparece popup de valoración
4. **Post-valoración**:
   - Redirección a lista de zonas
   - Badge ✅ en zona completada

---

## 📈 CÁLCULO DE TIEMPO AHORRADO

### Fórmula Base
```
Tiempo Ahorrado = Σ(Zonas Completadas × Tiempo Base Zona × Factor Complejidad)
```

### Factores de Complejidad
- **Horario nocturno** (22:00 - 08:00): ×1.5
- **Fin de semana**: ×1.3
- **Huésped internacional**: ×1.4
- **Primera visita**: ×1.2

### Tabla de Tiempos Base por Zona

| Zona | Tiempo Base | Justificación |
|------|-------------|---------------|
| Check-in | 15 min | Evita llamadas sobre códigos y acceso |
| WiFi | 8 min | Configuración y contraseñas |
| Cocina | 12 min | Uso de electrodomésticos especiales |
| Parking | 10 min | Ubicación y normas |
| Emergencias | 20 min | Información crítica |
| Baño | 6 min | Calentador, quirks |
| Terraza/Piscina | 5 min | Normas de uso |
| Transporte | 10 min | Rutas y horarios |

---

## 🔔 NOTIFICACIONES EN DASHBOARD

### Tipos de Notificaciones

1. **Zona Completada** 🟢
   - "Un huésped completó los pasos de {zona} en {propiedad}"
   - Prioridad: Baja
   - Color: Verde

2. **Nueva Valoración** ⭐
   - "Un usuario evaluó con {X} estrellas la zona {zona} de {propiedad}"
   - Prioridad: Media
   - Color: Amarillo

3. **Nuevo Comentario** 💬
   - "Nuevo comentario: '{texto}' en {zona}"
   - Prioridad: Media
   - Color: Morado

4. **Reporte Técnico** 🔧
   - "Reporte: '{problema}' en {zona} de {propiedad}"
   - Prioridad: Alta
   - Color: Rojo

5. **Vista de Paso** 👁️
   - "Un huésped vio un paso en {zona} de {propiedad}"
   - Prioridad: Baja
   - Color: Azul

---

## 📊 DASHBOARD STATS

### Card "Zonas Vistas"
```javascript
Total = Σ(Todos los pasos vistos en todas las propiedades)
```

### Actividad Reciente
- Últimas 20 interacciones
- Ordenadas por timestamp descendente
- Agrupadas por tipo con iconos distintivos

### Métricas Mensuales
- Total zonas completadas
- Valoración promedio
- Tiempo total ahorrado
- Problemas reportados/resueltos

---

## 🚀 FUTURAS MÉTRICAS (ROADMAP)

### Q1 2025
- **Tasa de rebote**: Huéspedes que abandonan sin completar
- **Tiempo en zona**: Duración promedio por zona
- **Zonas más consultadas**: Ranking por popularidad

### Q2 2025
- **Patrones de consulta**: Horarios pico por zona
- **Índice de resolución**: Problemas resueltos vs reportados
- **NPS por propiedad**: Net Promoter Score

### Q3 2025
- **Predicción de consultas**: IA para anticipar necesidades
- **Sugerencias automáticas**: Basadas en patrones
- **Benchmarking**: Comparación con propiedades similares

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Eventos a trackear

```javascript
// Vista de paso
track('step_viewed', {
  propertyId: string,
  zoneId: string,
  stepIndex: number,
  totalSteps: number,
  timestamp: Date
})

// Zona completada
track('zone_completed', {
  propertyId: string,
  zoneId: string,
  completionTime: number, // segundos
  timestamp: Date
})

// Valoración
track('zone_rated', {
  propertyId: string,
  zoneId: string,
  rating: 1-5,
  comment?: string,
  timestamp: Date
})

// Reporte
track('issue_reported', {
  propertyId: string,
  zoneId: string,
  description: string,
  urgency: 'high' | 'medium' | 'low',
  timestamp: Date
})
```

---

## 📝 NOTAS DE EVOLUCIÓN

Este documento es un sistema vivo que evoluciona con el producto. Cada nueva métrica debe:

1. Tener un propósito claro
2. Ser medible y accionable
3. Aportar valor al anfitrión
4. Respetar la privacidad del huésped
5. Integrarse con el ecosistema existente

---

## 🚀 ESTADO DE IMPLEMENTACIÓN

### ✅ COMPLETADO (Diciembre 2024)

1. **Frontend - Tracking de Pasos**
   - ✅ Tracking automático al hacer click "Siguiente"
   - ✅ Detección de zona completada
   - ✅ Modal de valoración con estrellas y comentarios
   - ✅ Botón "¡Ya lo tengo!" en último paso y paso único

2. **Vista Pública - Timeline Vertical**
   - ✅ Layout de itinerario con línea vertical progresiva
   - ✅ Círculos numerados con estados (activo, completado, pendiente)
   - ✅ Scroll automático al siguiente paso
   - ✅ Botones "Anterior" y "Siguiente" lado a lado en móvil
   - ✅ Visual feedback para pasos completados

3. **API Endpoints**
   - ✅ `/api/tracking/step-viewed`
   - ✅ `/api/tracking/zone-completed`
   - ✅ `/api/tracking/zone-rated`

4. **Dashboard - Métricas**
   - ✅ Card "Zonas Vistas" implementado
   - ✅ Actividad reciente con nuevos tipos de notificación
   - ✅ Algoritmo documentado y listo para datos reales

5. **UX/UI Mejoradas**
   - ✅ Modal de rating responsive con opción de reporte
   - ✅ Timeline visual con feedback progresivo
   - ✅ Tabulation fixed en menú hamburguesa
   - ✅ Diferenciación entre paso único y múltiples pasos

### 🔄 PRÓXIMOS PASOS

1. **Base de Datos**
   - Crear tabla `tracking_events` en Prisma
   - Conectar APIs con base de datos real
   - Implementar agregaciones para dashboard

2. **Dashboard Real**
   - Conectar "Zonas Vistas" con datos reales
   - Mostrar notificaciones reales en tiempo real
   - Implementar filtros por fecha

3. **Optimizaciones**
   - Batch tracking para mejor performance
   - Caché de métricas frecuentes
   - Analytics avanzados

---

*Última actualización: Diciembre 2024*
*Versión: 1.1 - Frontend y APIs implementados*