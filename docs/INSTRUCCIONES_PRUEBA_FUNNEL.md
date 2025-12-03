# 🧪 Instrucciones de Prueba del Embudo Completo

## Opción 1: Script Automatizado (Recomendado)

### Requisitos
- Servidor local corriendo (`npm run dev`)
- Acceso a la base de datos (Prisma)
- Resend API configurado (para emails)

### Ejecución
```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Script de prueba
npx tsx scripts/test-funnel-complete.ts
```

### Resultado Esperado
```
🚀 INICIANDO PRUEBA COMPLETA DEL EMBUDO

📝 PASO 1: Simulando completación del test de personalidad
✅ Test completado y guardado en BD

👤 PASO 2: Verificando creación del EmailSubscriber
✅ EmailSubscriber creado correctamente

📧 PASO 3: Verificando envío del Email Día 0
✅ Email Día 0 enviado exitosamente

🔐 PASO 4: Generando y validando token de descarga
✅ Token de descarga generado
✅ Token validado correctamente

📥 PASO 5: Simulando descarga del PDF
✅ Página de descarga accedida correctamente

📊 PASO 6: Verificando actualización de tracking
✅ Tracking de engagement actualizado

📄 PASO 7: Verificando existencia de PDFs
✅ PDF existe y está accesible

📋 RESUMEN DE LA PRUEBA
Total de pasos: 7
✅ Exitosos: 7
❌ Fallidos: 0
Tasa de éxito: 100.0%

🎉 ¡EMBUDO FUNCIONANDO PERFECTAMENTE!
```

---

## Opción 2: Prueba Manual (Flujo Completo)

### Paso 1: Completar el Test

1. Abre tu navegador en http://localhost:3000/host-profile/test
2. Completa las 16 preguntas del test
3. Ingresa tu email REAL (para recibir el email)
4. Ingresa tu nombre
5. Selecciona género
6. Haz clic en "Ver mi perfil de anfitrión"

**Verificar:**
- ✅ Ves la página de resultados con tu arquetipo
- ✅ No hay errores en consola del navegador
- ✅ No hay errores en terminal del servidor

---

### Paso 2: Verificar Email Día 0

1. Revisa tu bandeja de entrada (puede tardar 30-60 segundos)
2. Busca email de: "Itineramio <noreply@itineramio.com>"
3. Asunto: "🎯 Tu Perfil de Anfitrión: [ARQUETIPO]"

**Contenido del Email:**
```
Hola [Tu Nombre],

Acabas de descubrir que eres un anfitrión [ARQUETIPO]

🎁 Tu guía personalizada:
[Nombre de la guía según arquetipo]

[BOTÓN: Descargar mi guía]

[Explicación del arquetipo...]
```

**Verificar:**
- ✅ Email llegó a tu bandeja (no spam)
- ✅ Personalización correcta (nombre, arquetipo)
- ✅ Botón de descarga visible

---

### Paso 3: Descargar el PDF

1. Haz clic en el botón "Descargar mi guía"
2. Serás redirigido a: `https://itineramio.com/recursos/[slug]/download?token=xxx`
3. Deberías ver la página de descarga

**Verificar:**
- ✅ El token en la URL es válido (no error 401)
- ✅ Ves la página de descarga con info del lead magnet
- ✅ El PDF se descarga automáticamente
- ✅ El PDF se abre correctamente (8-12 páginas según arquetipo)

---

### Paso 4: Verificar Tracking en Base de Datos

Ejecuta este query en Prisma Studio o directamente:

```typescript
// Buscar tu subscriber
const subscriber = await prisma.emailSubscriber.findUnique({
  where: { email: 'tu-email@aqui.com' }
})

console.log(subscriber)
```

**Verificar:**
```javascript
{
  email: "tu-email@aqui.com",
  name: "Tu Nombre",
  archetype: "ESTRATEGA", // o el que salió en tu test
  currentJourneyStage: "guide_downloaded", // ✅ Debe ser esto
  engagementScore: "hot", // ✅ Debe ser "hot"
  emailsSent: 1, // ✅ Email Día 0 enviado
  downloadedGuide: true, // ✅ PDF descargado
  lastEmailSentAt: [timestamp reciente],
  lastEngagement: [timestamp de la descarga]
}
```

---

### Paso 5: Verificar PDFs Existen

Navega a la carpeta de PDFs:
```bash
ls -lh public/downloads/
```

**Verificar que existan los 8 PDFs:**
- ✅ estratega-5-kpis.pdf (~500 KB)
- ✅ sistematico-47-tareas.pdf (~1.2 MB)
- ✅ diferenciador-storytelling.pdf (~730 KB)
- ✅ ejecutor-modo-ceo.pdf (~680 KB)
- ✅ resolutor-27-crisis.pdf (~610 KB)
- ✅ experiencial-corazon-escalable.pdf (~700 KB)
- ✅ equilibrado-versatil-excepcional.pdf (~1.0 MB)
- ✅ improvisador-kit-anti-caos.pdf (~1.2 MB)

---

## Opción 3: Verificar Email Sequences (Días 3, 7, 10, 14)

### Manualmente forzar envío de Email Día 3

```bash
# Simular que han pasado 3 días
npx tsx scripts/test-email-sequence-manual.ts
```

O directamente manipular la BD:
```typescript
// Actualizar lastEmailSentAt para que parezca que fue hace 3 días
await prisma.emailSubscriber.update({
  where: { email: 'tu-email@aqui.com' },
  data: {
    lastEmailSentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
})

// Luego ejecutar el cron job manualmente
// Visita: http://localhost:3000/api/cron/send-sequence-emails
```

**Verificar:**
- ✅ Email Día 3 llega con contenido personalizado por arquetipo
- ✅ emailsSent se incrementa a 2
- ✅ lastEmailSentAt se actualiza

---

## 🚨 Troubleshooting

### El email no llega

**Causa posible:**
- Resend API no configurado
- Email en sandbox mode (solo envía a emails verificados)
- Resend cuota excedida

**Solución:**
1. Verifica que `RESEND_API_KEY` esté en `.env.local`
2. Revisa logs del servidor:
   ```bash
   # Busca estos logs:
   📧 Welcome email - subscriberId: xxx, token: generated
   ✅ Welcome email sent to: tu@email.com
   ```
3. Si ves error, revisa tu cuenta de Resend:
   - https://resend.com/emails
   - Verifica límites de cuota
   - Asegúrate de que el dominio esté verificado

### Token inválido o expirado

**Causa posible:**
- Token mal formado
- Token tiene más de 30 días
- subscriberId no existe en BD

**Solución:**
1. Verifica el token con:
   ```typescript
   import { validateDownloadToken } from '../src/lib/tokens'
   const result = validateDownloadToken('tu-token-aqui')
   console.log(result)
   ```
2. Si es inválido, genera uno nuevo desde el script

### PDF no se descarga

**Causa posible:**
- Archivo no existe en `/public/downloads/`
- Permisos incorrectos
- Ruta incorrecta

**Solución:**
1. Verifica que existen:
   ```bash
   ls -la public/downloads/*.pdf
   ```
2. Si faltan, regenera los PDFs:
   ```bash
   npx tsx scripts/generate-pdfs.ts
   ```

### downloadedGuide no se actualiza

**Causa posible:**
- La página de descarga no ejecuta la actualización
- Error en el servidor
- subscriberId no coincide con el token

**Solución:**
1. Revisa logs en `/app/recursos/[slug]/download/page.tsx`
2. Verifica que el token tenga el subscriberId correcto
3. Comprueba que no hay errores en consola del servidor

---

## ✅ Checklist de Éxito

Marca cada punto cuando lo hayas verificado:

### Email Día 0 (Bienvenida + Lead Magnet)
- [ ] Email llega a bandeja en menos de 1 minuto
- [ ] Email tiene personalización correcta (nombre + arquetipo)
- [ ] Botón de descarga funciona
- [ ] Token es válido por 30 días
- [ ] PDF se descarga automáticamente
- [ ] PDF tiene el contenido correcto
- [ ] `emailsSent` se incrementa a 1
- [ ] `downloadedGuide` = true después de descargar
- [ ] `engagementScore` = 'hot' después de descargar
- [ ] `currentJourneyStage` = 'guide_downloaded'

### Email Día 3 (Errores Comunes)
- [ ] Email llega 3 días después del Día 0
- [ ] Contenido personalizado por arquetipo
- [ ] `emailsSent` = 2
- [ ] `lastEmailSentAt` actualizado

### Email Día 7 (Caso de Estudio: Laura)
- [ ] Email llega 7 días después del Día 0
- [ ] Historia de Laura completa
- [ ] Call-to-action claro
- [ ] `emailsSent` = 3

### Email Día 10 (Invitación Trial)
- [ ] Email llega 10 días después del Día 0
- [ ] Invitación clara a probar 15 días
- [ ] Link al registro funciona
- [ ] `emailsSent` = 4

### Email Día 14 (Urgencia Final)
- [ ] Email llega 14 días después del Día 0
- [ ] Tono de urgencia sin ser agresivo
- [ ] Última oportunidad clara
- [ ] `emailsSent` = 5

---

## 📊 Métricas a Monitorear

Una vez que el embudo esté en producción:

### Métricas Clave (KPIs)
1. **Tasa de conversión del test** (completados / iniciados)
2. **Tasa de captura de email** (con email / sin email)
3. **Tasa de apertura Email Día 0** (target: >40%)
4. **Tasa de descarga del lead magnet** (target: >60%)
5. **Tasa de conversión a trial** (Días 10-14, target: >15%)
6. **Engagement score distribution** (cold/warm/hot)

### Cómo Monitorear
```sql
-- Total de subscribers por arquetipo
SELECT archetype, COUNT(*) as total
FROM EmailSubscriber
GROUP BY archetype
ORDER BY total DESC;

-- Tasa de descarga
SELECT
  COUNT(*) as total_subscribers,
  SUM(CASE WHEN downloadedGuide = true THEN 1 ELSE 0 END) as downloads,
  ROUND(100.0 * SUM(CASE WHEN downloadedGuide = true THEN 1 ELSE 0 END) / COUNT(*), 2) as tasa_descarga
FROM EmailSubscriber;

-- Engagement score distribution
SELECT
  engagementScore,
  COUNT(*) as cantidad,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM EmailSubscriber), 2) as porcentaje
FROM EmailSubscriber
GROUP BY engagementScore;

-- Promedio de emails por subscriber
SELECT
  AVG(emailsSent) as promedio_emails,
  MAX(emailsSent) as max_emails,
  MIN(emailsSent) as min_emails
FROM EmailSubscriber;
```

---

## 🎯 Próximos Pasos

Una vez verificado que todo funciona:

1. **Deploy a producción**
   - Asegúrate de que `RESEND_API_KEY` esté en variables de entorno de Vercel
   - Verifica que el dominio esté verificado en Resend
   - Configura el cron job en Vercel para `/api/cron/send-sequence-emails`

2. **Configurar GA4 tracking**
   - Agregar `NEXT_PUBLIC_GA_ID` a variables de entorno
   - Implementar tracking calls en test completion
   - Trackear descargas de PDFs

3. **Crear artículos de blog**
   - Caso de Laura (storytelling)
   - RevPAR vs Ocupación (técnico para ESTRATEGA)
   - Etc.

4. **Dashboard de métricas**
   - Visualización en tiempo real
   - Gráficos de conversión
   - Alertas de bajo engagement
