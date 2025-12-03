# 📊 Diagrama Visual del Embudo de Email Marketing

## 🎯 Flujo Completo (Vista General)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO VISITA LA WEB                         │
│                  https://itineramio.com                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                 TEST DE PERSONALIDAD                             │
│              /host-profile/test                                  │
│                                                                   │
│  • 16 preguntas sobre gestión de Airbnb                         │
│  • Solicita: nombre, email, género                              │
│  • Calcula arquetipo basado en respuestas                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND: /api/host-profile/submit                   │
│                                                                   │
│  ✅ Guarda HostProfileTest                                      │
│  ✅ Crea/actualiza EmailSubscriber                              │
│     • archetype: ESTRATEGA | SISTEMÁTICO | etc.                │
│     • currentJourneyStage: 'test_completed'                     │
│     • engagementScore: 'warm'                                   │
│  ✅ Envía Email Día 0 (inmediato)                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ├─────────────────────────────────────┐
                  │                                     │
                  ▼                                     ▼
┌─────────────────────────────────┐   ┌──────────────────────────────┐
│     EMAIL DÍA 0 ENVIADO         │   │   USUARIO VE RESULTADOS      │
│   📧 Resend API                 │   │   /host-profile/results/[id] │
│                                 │   │                              │
│  De: Itineramio <noreply@>     │   │  • Su arquetipo              │
│  Asunto: 🎯 Tu Perfil           │   │  • Fortalezas                │
│                                 │   │  • Debilidades               │
│  Contenido:                     │   │  • Recomendaciones           │
│  • Bienvenida personalizada     │   └──────────────────────────────┘
│  • Explicación del arquetipo    │
│  • 🎁 Botón descarga PDF        │
│  • Token válido 30 días         │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│           USUARIO HACE CLIC EN BOTÓN "DESCARGAR"                │
│                                                                   │
│  URL: /recursos/[slug]/download?token=xxxxx                     │
│                                                                   │
│  Ejemplo:                                                         │
│  /recursos/estratega-5-kpis/download?token=eyJzdWJzY3JpYmVy...  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│       BACKEND: /app/recursos/[slug]/download/page.tsx            │
│                                                                   │
│  1. Valida token con validateDownloadToken()                    │
│     ✅ Token válido? → Continúa                                 │
│     ❌ Token inválido/expirado? → Error                         │
│                                                                   │
│  2. Busca EmailSubscriber por ID del token                      │
│                                                                   │
│  3. Actualiza tracking en BD:                                   │
│     • downloadedGuide: true                                     │
│     • currentJourneyStage: 'guide_downloaded'                   │
│     • engagementScore: 'hot' (sube de 'warm')                   │
│     • lastEngagement: NOW()                                     │
│                                                                   │
│  4. Sirve PDF para descarga                                     │
│     /public/downloads/[slug].pdf                                │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              USUARIO DESCARGA Y LEE EL PDF                       │
│                                                                   │
│  Contenido según arquetipo:                                      │
│  • ESTRATEGA: 5 KPIs que todo anfitrión debe medir              │
│  • SISTEMÁTICO: 47 Tareas automatizables                        │
│  • DIFERENCIADOR: Storytelling que convierte                    │
│  • EJECUTOR: Del modo bombero al modo CEO                       │
│  • RESOLUTOR: Playbook anti-crisis (27 escenarios)              │
│  • EXPERIENCIAL: El corazón escalable                           │
│  • EQUILIBRADO: De versátil a excepcional                       │
│  • IMPROVISADOR: El kit anti-caos                               │
│                                                                   │
│  📄 8-12 páginas de contenido accionable                        │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │  ⏰ ESPERA 3 DÍAS
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│         CRON JOB: /api/cron/send-sequence-emails                │
│                    (ejecuta diariamente)                         │
│                                                                   │
│  • Busca subscribers donde lastEmailSentAt >= 3 días            │
│  • emailsSent < 5 (aún en secuencia)                            │
│  • Envía Email Día 3                                            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              📧 EMAIL DÍA 3: ERRORES COMUNES                    │
│                                                                   │
│  Contenido personalizado por arquetipo:                         │
│                                                                   │
│  ESTRATEGA:                                                      │
│  • "Obsesionarse con RevPAR sin mirar ocupación"               │
│  • "Optimizar precio pero descuidar costes"                     │
│  • "Olvidar que los datos sin acción no sirven"                │
│                                                                   │
│  SISTEMÁTICO:                                                    │
│  • "Automatizar sin primero optimizar el proceso"              │
│  • "Crear sistemas tan complejos que nadie los usa"            │
│  • "Obsesionarse con la perfección del sistema"                │
│                                                                   │
│  [Similar para los otros 6 arquetipos...]                       │
│                                                                   │
│  ✅ Actualiza: emailsSent = 2, lastEmailSentAt = NOW()          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │  ⏰ ESPERA 4 DÍAS MÁS (total 7 días)
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│          📧 EMAIL DÍA 7: CASO DE ESTUDIO - LAURA                │
│                                                                   │
│  Historia completa de transformación:                            │
│                                                                   │
│  "Laura tenía 3 propiedades en Barcelona.                       │
│   Trabajaba 12 horas al día. Ocupación: 68%.                    │
│   Beneficio: €2,100/mes después de gastos.                      │
│                                                                   │
│   Problemas:                                                     │
│   • Sin tiempo para su familia                                  │
│   • Constantes emergencias de última hora                       │
│   • Sensación de estar siempre 'apagando fuegos'                │
│                                                                   │
│   Después de implementar Itineramio:                             │
│   • Automatizó 80% de tareas repetitivas                        │
│   • Subió ocupación a 89%                                       │
│   • Aumentó beneficio a €3,850/mes                              │
│   • Recuperó 15 horas/semana                                    │
│   • Expandió a 5 propiedades sin aumentar horas de trabajo      │
│                                                                   │
│   'Pasé de ser una empleada de mi negocio                       │
│    a ser una CEO de mi imperio Airbnb' - Laura G."              │
│                                                                   │
│  CTA: "¿Quieres resultados como Laura?"                         │
│                                                                   │
│  ✅ Actualiza: emailsSent = 3, lastEmailSentAt = NOW()          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │  ⏰ ESPERA 3 DÍAS MÁS (total 10 días)
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│       📧 EMAIL DÍA 10: INVITACIÓN TRIAL DE 15 DÍAS              │
│                                                                   │
│  "Has aprendido los errores comunes.                            │
│   Has visto casos de éxito reales.                              │
│   Ahora es tu turno de experimentar el cambio.                  │
│                                                                   │
│   🎁 OFERTA ESPECIAL:                                           │
│   Evalúa Itineramio durante 15 días - SIN COMPROMISO            │
│                                                                   │
│   ✓ Acceso completo a todas las funciones                       │
│   ✓ QR personalizados ilimitados                                │
│   ✓ Manuales digitales automáticos                              │
│   ✓ Sistema de gestión de propiedades                           │
│   ✓ Soporte prioritario                                         │
│                                                                   │
│   Al final de los 15 días:                                      │
│   • Si decides continuar: Solo €9-€39/mes                       │
│   • Si no te convence: Cancelas sin cargos                      │
│                                                                   │
│   [BOTÓN: INICIAR MI EVALUACIÓN DE 15 DÍAS]"                    │
│                                                                   │
│  ✅ Actualiza: emailsSent = 4, lastEmailSentAt = NOW()          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │  ⏰ ESPERA 4 DÍAS MÁS (total 14 días)
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│         📧 EMAIL DÍA 14: ÚLTIMO CONTACTO / URGENCIA             │
│                                                                   │
│  "Esta es nuestra última conversación... por ahora.             │
│                                                                   │
│   En los últimos 14 días te hemos compartido:                   │
│   ✓ Tu perfil único como anfitrión                              │
│   ✓ Una guía personalizada con acciones concretas               │
│   ✓ Los errores que frenan a los anfitriones como tú            │
│   ✓ Un caso real de transformación                              │
│   ✓ Una invitación para evaluar nuestra herramienta            │
│                                                                   │
│   Si aún no has probado Itineramio, déjame hacerte             │
│   una pregunta directa:                                          │
│                                                                   │
│   ¿Cuánto vale para ti recuperar 10-15 horas por semana?        │
│   ¿Cuánto vale aumentar tu ocupación en un 20%?                 │
│   ¿Cuánto vale dormir tranquilo sabiendo que todo funciona?     │
│                                                                   │
│   No vamos a insistir más.                                       │
│   La decisión es tuya.                                           │
│                                                                   │
│   Pero si decides dar el paso, aquí estaremos.                  │
│                                                                   │
│   [BOTÓN: SÍ, QUIERO PROBARLO]                                  │
│                                                                   │
│   PD: Si no es el momento, lo entendemos.                        │
│       Pero guarda este email.                                    │
│       Cuando estés listo, vuelve.                                │
│       Tu cuenta de 15 días te estará esperando."                │
│                                                                   │
│  ✅ Actualiza: emailsSent = 5, lastEmailSentAt = NOW()          │
│  ✅ Fin de la secuencia automática                              │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ├──────────────────┬──────────────────┐
                  │                  │                  │
                  ▼                  ▼                  ▼
         ┌────────────────┐  ┌────────────────┐  ┌──────────────┐
         │  SE REGISTRA   │  │  NO RESPONDE   │  │  DESUSCRIBE  │
         │                │  │                │  │              │
         │  → Comienza    │  │  → Queda en    │  │  → Se marca  │
         │    trial       │  │    lista       │  │    como      │
         │    15 días     │  │    para        │  │    inactive  │
         │                │  │    remarketing │  │              │
         └────────────────┘  └────────────────┘  └──────────────┘
```

---

## 🔄 Ciclo de Vida del EmailSubscriber

```
┌──────────────────────────────────────────────────────────────┐
│                    ESTADOS DEL SUBSCRIBER                     │
└──────────────────────────────────────────────────────────────┘

Día 0: Test completado
┌─────────────────────────────────────┐
│ currentJourneyStage: test_completed │
│ engagementScore: warm               │
│ emailsSent: 1                       │
│ downloadedGuide: false              │
│ trialStartedAt: null                │
└─────────────────────────────────────┘
                │
                │ Usuario descarga PDF
                ▼
┌──────────────────────────────────────┐
│ currentJourneyStage: guide_downloaded│
│ engagementScore: hot ⬆️              │
│ emailsSent: 1                        │
│ downloadedGuide: true ✅             │
│ lastEngagement: [timestamp]          │
└──────────────────────────────────────┘
                │
                │ +3 días
                ▼
┌──────────────────────────────────────┐
│ currentJourneyStage: nurturing       │
│ engagementScore: hot                 │
│ emailsSent: 2 (Email Día 3)          │
└──────────────────────────────────────┘
                │
                │ +4 días (total 7)
                ▼
┌──────────────────────────────────────┐
│ currentJourneyStage: nurturing       │
│ emailsSent: 3 (Email Día 7)          │
└──────────────────────────────────────┘
                │
                │ +3 días (total 10)
                ▼
┌──────────────────────────────────────┐
│ currentJourneyStage: trial_offered   │
│ emailsSent: 4 (Email Día 10)         │
└──────────────────────────────────────┘
                │
                │ +4 días (total 14)
                ▼
┌──────────────────────────────────────┐
│ currentJourneyStage: final_nudge     │
│ emailsSent: 5 (Email Día 14)         │
└──────────────────────────────────────┘
                │
      ┌─────────┴─────────┐
      │                   │
      ▼                   ▼
┌─────────────┐    ┌──────────────┐
│ SE CONVIERTE│    │  NO CONVIERTE│
│             │    │              │
│ Crea User   │    │ Queda en BD  │
│ Plan: BASIC │    │ para         │
│ Trial 15d   │    │ remarketing  │
└─────────────┘    └──────────────┘
```

---

## 📊 Engagement Score Evolution

```
┌────────────────────────────────────────────────────────────┐
│             EVOLUCIÓN DEL ENGAGEMENT SCORE                  │
└────────────────────────────────────────────────────────────┘

COLD (frío)
  │
  │  No es posible llegar aquí en el flujo normal.
  │  Solo se marca COLD si el subscriber:
  │  • No abre emails durante 30 días
  │  • No interactúa con ningún contenido
  │
  └─────────────────────────────────────────────────

WARM (tibio) ⬅️ ESTADO INICIAL
  │
  │  • Completó el test
  │  • Proporcionó email
  │  • Recibió Email Día 0
  │
  ▼
  ├─ Abre email pero no descarga PDF
  │  → Permanece WARM
  │
  ├─ No abre email en 7 días
  │  → Baja a COLD ⬇️
  │
  └─ Descarga el PDF
     → Sube a HOT ⬆️

HOT (caliente) ⬅️ ESTADO OBJETIVO
  │
  │  • Descargó el PDF
  │  • Abre emails consistentemente
  │  • Hace clic en CTAs
  │
  ├─ Se registra para trial
  │  → CONVERTIDO ✅
  │
  ├─ No interactúa en 14 días
  │  → Baja a WARM ⬇️
  │
  └─ Continúa interactuando
     → Permanece HOT (candidato ideal)
```

---

## 🎯 Arquetipo → Lead Magnet Mapping

```
┌─────────────────┬─────────────────────────────────────────────────┐
│   ARQUETIPO     │  LEAD MAGNET (PDF)                              │
├─────────────────┼─────────────────────────────────────────────────┤
│ ESTRATEGA       │  📊 5 KPIs que todo anfitrión debe medir        │
│                 │  estratega-5-kpis.pdf (499 KB, 8 páginas)       │
├─────────────────┼─────────────────────────────────────────────────┤
│ SISTEMÁTICO     │  ⚙️ 47 Tareas automatizables                    │
│                 │  sistematico-47-tareas.pdf (1.2 MB, 10 páginas) │
├─────────────────┼─────────────────────────────────────────────────┤
│ DIFERENCIADOR   │  ✨ Storytelling que convierte                  │
│                 │  diferenciador-storytelling.pdf (731 KB, 9 pág) │
├─────────────────┼─────────────────────────────────────────────────┤
│ EJECUTOR        │  🚀 Del modo bombero al modo CEO                │
│                 │  ejecutor-modo-ceo.pdf (681 KB, 8 páginas)      │
├─────────────────┼─────────────────────────────────────────────────┤
│ RESOLUTOR       │  🛡️ Playbook anti-crisis (27 escenarios)        │
│                 │  resolutor-27-crisis.pdf (610 KB, 12 páginas)   │
├─────────────────┼─────────────────────────────────────────────────┤
│ EXPERIENCIAL    │  ❤️ El corazón escalable                        │
│                 │  experiencial-corazon-escalable.pdf (707 KB)    │
├─────────────────┼─────────────────────────────────────────────────┤
│ EQUILIBRADO     │  ⚖️ De versátil a excepcional                   │
│                 │  equilibrado-versatil-excepcional.pdf (1.0 MB)  │
├─────────────────┼─────────────────────────────────────────────────┤
│ IMPROVISADOR    │  🎲 El kit anti-caos                            │
│                 │  improvisador-kit-anti-caos.pdf (1.2 MB, 9 pág) │
└─────────────────┴─────────────────────────────────────────────────┘
```

---

## 🔐 Sistema de Tokens de Descarga

```
┌────────────────────────────────────────────────────────────────┐
│               GENERACIÓN Y VALIDACIÓN DE TOKENS                 │
└────────────────────────────────────────────────────────────────┘

1. GENERACIÓN (en Email Día 0)
   ┌──────────────────────────────────────────────┐
   │ generateDownloadToken(subscriberId, slug)    │
   └──────────────────────────────────────────────┘
                      │
                      ▼
   ┌──────────────────────────────────────────────┐
   │ Payload = {                                  │
   │   subscriberId: "cmxxx...",                  │
   │   leadMagnetSlug: "estratega-5-kpis",        │
   │   timestamp: 1701234567890,                  │
   │   random: "a3f8b2c9d1e4"                     │
   │ }                                            │
   └──────────────────────────────────────────────┘
                      │
                      ▼
   ┌──────────────────────────────────────────────┐
   │ Token = base64url(JSON.stringify(payload))   │
   └──────────────────────────────────────────────┘
                      │
                      ▼
   "eyJzdWJzY3JpYmVySWQiOiJjbXh4eC4uLiIsImxl..."

2. VALIDACIÓN (en página de descarga)
   ┌──────────────────────────────────────────────┐
   │ validateDownloadToken(token)                 │
   └──────────────────────────────────────────────┘
                      │
                      ▼
   ┌──────────────────────────────────────────────┐
   │ 1. Decodifica base64url → JSON               │
   │ 2. Verifica campos requeridos                │
   │ 3. Calcula edad del token:                   │
   │    now - timestamp                           │
   │ 4. Valida: edad < 30 días                    │
   └──────────────────────────────────────────────┘
                      │
            ┌─────────┴─────────┐
            │                   │
            ▼                   ▼
      ┌──────────┐        ┌──────────┐
      │  VÁLIDO  │        │ INVÁLIDO │
      │          │        │          │
      │ Permite  │        │ Error    │
      │ descarga │        │ 401      │
      └──────────┘        └──────────┘

SEGURIDAD:
✅ Token no es JWT (más simple, suficiente para este caso)
✅ Contiene datos no sensibles (solo IDs públicos)
✅ Expira automáticamente en 30 días
✅ Requiere subscriberId válido en BD
✅ No reutilizable después de 30 días
```

---

## 📈 Métricas del Embudo (Ejemplo Teórico)

```
┌────────────────────────────────────────────────────────────────┐
│                  FUNNEL DE CONVERSIÓN                           │
└────────────────────────────────────────────────────────────────┘

1000 visitantes únicos
    │
    │ 45% completan el test
    ▼
 450 tests completados
    │
    │ 90% proporcionan email
    ▼
 405 subscribers creados ────┐
    │                         │
    │ 95% reciben Email Día 0 │ emailsSent = 1
    ▼                         │
 385 emails entregados ───────┘
    │
    │ 42% abren el email (tasa de apertura)
    ▼
 162 emails abiertos
    │
    │ 65% hacen clic en "Descargar"
    ▼
 105 descargas de PDF ────────┐
    │                          │ downloadedGuide = true
    │                          │ engagementScore: warm → hot
    │                          │
    │ 90% continúan activos    │
    ▼                          │
  95 subscribers HOT ──────────┘
    │
    │ +3 días: Email Día 3
    ▼
  95 emails enviados
    │
    │ 38% abren (engagement aún alto)
    ▼
  36 emails abiertos
    │
    │ +4 días: Email Día 7 (caso Laura)
    ▼
  95 emails enviados
    │
    │ 40% abren (storytelling engancha)
    ▼
  38 emails abiertos
    │
    │ +3 días: Email Día 10 (trial invite)
    ▼
  95 emails enviados
    │
    │ 48% abren (curiosidad por oferta)
    ▼
  46 emails abiertos
    │
    │ 22% hacen clic en CTA
    ▼
  21 visitas a página de registro
    │
    │ 70% completan registro
    ▼
  15 usuarios registrados (TRIAL) ✅
    │
    │ Tasa de conversión final:
    │ 15 / 405 = 3.7% de subscribers
    │ 15 / 1000 = 1.5% de visitantes
    │
    └─ OBJETIVO: Convertir a planes de pago

MÉTRICAS CLAVE:
• Test completion rate: 45% (objetivo: >40%)
• Email capture rate: 90% (objetivo: >85%)
• Email open rate: 42% (objetivo: >35%)
• PDF download rate: 65% (objetivo: >60%)
• Trial conversion rate: 3.7% (objetivo: >3%)
```

---

## 🚀 Sistema de Cron Jobs

```
┌────────────────────────────────────────────────────────────────┐
│           EJECUCIÓN AUTOMÁTICA DE EMAILS                        │
└────────────────────────────────────────────────────────────────┘

VERCEL CRON (configurado en vercel.json)
  │
  │ Ejecuta cada día a las 10:00 AM UTC
  │
  ▼
/api/cron/send-sequence-emails
  │
  ├─ 1. Buscar subscribers elegibles para Día 3
  │    WHERE lastEmailSentAt <= NOW() - 3 days
  │    AND emailsSent = 1
  │    │
  │    └─→ Envía emails Día 3
  │        Actualiza: emailsSent = 2
  │
  ├─ 2. Buscar subscribers elegibles para Día 7
  │    WHERE lastEmailSentAt <= NOW() - 7 days
  │    AND emailsSent = 2
  │    │
  │    └─→ Envía emails Día 7
  │        Actualiza: emailsSent = 3
  │
  ├─ 3. Buscar subscribers elegibles para Día 10
  │    WHERE lastEmailSentAt <= NOW() - 10 days
  │    AND emailsSent = 3
  │    │
  │    └─→ Envía emails Día 10
  │        Actualiza: emailsSent = 4
  │
  └─ 4. Buscar subscribers elegibles para Día 14
       WHERE lastEmailSentAt <= NOW() - 14 days
       AND emailsSent = 4
       │
       └─→ Envía emails Día 14
           Actualiza: emailsSent = 5
           Marca: secuencia completada

LOGS (visible en Vercel dashboard):
✅ Emails sent: 47
✅ Day 3: 12 emails
✅ Day 7: 15 emails
✅ Day 10: 11 emails
✅ Day 14: 9 emails
```
