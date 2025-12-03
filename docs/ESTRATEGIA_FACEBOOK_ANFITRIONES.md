# 🎯 Estrategia de Adquisición: Facebook → Email → Nurturing → Conversión

## 📊 Flujo Completo

```
┌────────────────────────────────────────────────────────────────┐
│  GRUPO DE FACEBOOK: "Anfitriones de Airbnb España"            │
│  (o grupos similares de gestión de alojamientos)              │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│  POST: "¿Qué tipo de anfitrión eres?"                         │
│                                                                 │
│  COPY:                                                          │
│  "Después de analizar a +500 anfitriones, he descubierto      │
│   que todos caemos en uno de 8 perfiles.                      │
│                                                                 │
│   Cada uno tiene fortalezas únicas...                         │
│   Y errores específicos que le frenan.                        │
│                                                                 │
│   He creado un test de 2 minutos que identifica tu perfil.   │
│   + Te dice exactamente qué te está frenando.                 │
│                                                                 │
│   100% gratuito. Sin compromiso.                              │
│                                                                 │
│   👉 [LINK AL TEST]"                                          │
│                                                                 │
│  [Imagen: 8 iconos representando cada arquetipo]              │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│  TEST DE PERSONALIDAD                                          │
│  /host-profile/test?source=facebook_group                     │
│                                                                 │
│  16 preguntas que determinan:                                  │
│  1. Arquetipo (ESTRATEGA, SISTEMÁTICO, etc.)                  │
│  2. NUEVO: Intereses/Problemas específicos                    │
│     - [ ] Gestión de calendarios                              │
│     - [ ] Creatividad en alojamiento                          │
│     - [ ] Conseguir mejores reviews                           │
│     - [ ] Aumentar ocupación                                  │
│     - [ ] Optimizar pricing                                   │
│     - [ ] Automatización de tareas                            │
│     - [ ] Comunicación con huéspedes                          │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│  CAPTURA DE EMAIL + INTERESES                                  │
│                                                                 │
│  "Para recibir tus resultados y tu guía personalizada:        │
│   Déjanos tu email"                                            │
│                                                                 │
│  [Input: Email]                                                │
│  [Input: Nombre]                                               │
│                                                                 │
│  "¿En qué área necesitas más ayuda? (selecciona hasta 3)"     │
│  [ ] Gestión de calendarios y disponibilidad                  │
│  [ ] Decoración y creatividad en el alojamiento               │
│  [ ] Conseguir reviews de 5 estrellas                         │
│  [ ] Aumentar mi ocupación                                    │
│  [ ] Optimizar mis precios (dynamic pricing)                  │
│  [ ] Automatizar tareas repetitivas                           │
│  [ ] Comunicación efectiva con huéspedes                      │
│                                                                 │
│  [Botón: VER MIS RESULTADOS]                                  │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│  BACKEND: Guardar en EmailSubscriber                          │
│                                                                 │
│  Campos nuevos:                                                │
│  • interests: ['reviews', 'pricing', 'automation']            │
│  • topPriority: 'reviews' (el primero seleccionado)           │
│  • contentTrack: Determinado por intereses                    │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│  EMAIL DÍA 0: Resultados + Lead Magnet                        │
│                                                                 │
│  Asunto: "🎯 Tu perfil: [ARQUETIPO] + Tu guía personalizada"  │
│                                                                 │
│  "Hola [Nombre],                                               │
│                                                                 │
│   Has descubierto que eres un anfitrión [ARQUETIPO].          │
│                                                                 │
│   Esto significa que tienes fortalezas en:                    │
│   ✓ [Fortaleza 1]                                             │
│   ✓ [Fortaleza 2]                                             │
│                                                                 │
│   Pero también hay algo que te está frenando:                 │
│   ⚠️ [Punto ciego principal]                                  │
│                                                                 │
│   🎁 Descarga tu guía: [NOMBRE SEGÚN ARQUETIPO]               │
│   [Botón de descarga con token]                               │
│                                                                 │
│   Y como me dijiste que tu prioridad es [TOP PRIORITY],       │
│   en los próximos días te voy a compartir:                    │
│                                                                 │
│   📚 Artículos específicos sobre [TOP PRIORITY]               │
│   💡 Casos reales de anfitriones que lo lograron              │
│   🔧 Herramientas que te van a ayudar                         │
│                                                                 │
│   Sin spam. Solo valor.                                       │
│                                                                 │
│   Un abrazo,                                                   │
│   [Tu nombre]"                                                 │
└────────────────────────────────────────────────────────────────┘
                          │
                          ├─────────────┬──────────────┬──────────────┐
                          │             │              │              │
                          ▼             ▼              ▼              ▼
              ┌────────────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐
              │ TRACK REVIEWS  │ │  PRICING │ │ CALENDAR │ │ AUTOMATION  │
              │                │ │          │ │          │ │             │
              │ Día 3: Artículo│ │ Día 3:   │ │ Día 3:   │ │ Día 3:      │
              │ "5 Secretos    │ │ "RevPAR" │ │ "Sincro" │ │ "47 Tareas" │
              │ para Reviews   │ │ técnico  │ │ múltiple"│ │ automati-   │
              │ de 5⭐"        │ │          │ │          │ │ zables"     │
              │                │ │          │ │          │ │             │
              │ Día 7: Caso    │ │ Día 7:   │ │ Día 7:   │ │ Día 7:      │
              │ de Laura       │ │ Caso de  │ │ Caso de  │ │ Caso de     │
              │ (reviews)      │ │ pricing  │ │ multi-   │ │ automati-   │
              │                │ │          │ │ property │ │ zación      │
              │                │ │          │ │          │ │             │
              │ Día 10: Intro  │ │ Día 10:  │ │ Día 10:  │ │ Día 10:     │
              │ a Itineramio   │ │ Intro a  │ │ Intro a  │ │ Intro a     │
              │ (manuales →    │ │ herram.  │ │ gestión  │ │ Itineramio  │
              │ mejor comunic. │ │          │ │          │ │ (manuales   │
              │ → reviews)     │ │          │ │          │ │ automáticos)│
              └────────────────┘ └──────────┘ └──────────┘ └─────────────┘
                          │             │              │              │
                          └─────────────┴──────────────┴──────────────┘
                                        │
                                        ▼
                          ┌──────────────────────────────┐
                          │  Día 14: Trial de 15 días   │
                          │  Invitación personalizada    │
                          └──────────────────────────────┘
```

---

## 📝 PASO 1: Post de Facebook (Texto Completo)

### Opción A: Post Directo (Sin Imagen)

```
¿Qué tipo de anfitrión eres? 🏠

Llevo 3 años analizando anfitriones de Airbnb.
He trabajado con más de 500 propiedades.

Y he descubierto algo fascinante:

TODOS caemos en uno de 8 perfiles operativos.

Cada perfil tiene:
✓ Superpoderes únicos
✓ Puntos ciegos peligrosos
✓ Un camino específico hacia el éxito

Por ejemplo:

El ESTRATEGA es increíble con datos y KPIs...
Pero se obsesiona tanto con números que descuida la operación.

El EJECUTOR actúa rapidísimo y resuelve todo al instante...
Pero trabaja 12h/día porque no tiene sistemas.

El SISTEMÁTICO automatiza absolutamente todo...
Pero pierde flexibilidad y trato personal.

¿Ves el patrón?

No se trata de ser "bueno" o "malo".
Se trata de conocer TU perfil.
Y optimizar desde ahí.

He creado un test de 2 minutos que:
• Identifica tu arquetipo exacto
• Te dice tus fortalezas ocultas
• Te muestra qué te está frenando
• Te da una guía personalizada (PDF gratuito)

Sin registro. Sin spam. Sin compromiso.

👉 Haz el test aquí: [LINK]

Más de 500 anfitriones ya lo han hecho.
¿Te atreves a descubrir el tuyo?

PD: Al final del test, puedes elegir en qué área necesitas más ayuda (reviews, pricing, automatización, etc.). Te enviaré contenido específico para TI.
```

### Opción B: Post con Curiosidad (Storytelling)

```
María trabajaba 15 horas al día.
3 propiedades. 68% ocupación.
Ganaba €2,100/mes después de gastos.

"Estoy quemada", me dijo.

Le hice un test de 2 minutos.

Resultado: Anfitriona EJECUTORA.

"¿Qué significa eso?"

Le expliqué:
"Eres increíble resolviendo problemas al instante.
Respondes mensajes en 5 minutos.
Los huéspedes te aman.

Pero no tienes sistemas.
Cada problema lo resuelves TÚ, en el momento.
Por eso trabajas tanto."

Dos meses después, María:
✓ 89% ocupación
✓ €3,850/mes
✓ 8 horas/semana

¿Qué cambió?

No cambió su personalidad.
Cambió su ESTRATEGIA.

Porque cada tipo de anfitrión necesita tácticas diferentes.

Hay 8 perfiles.
Cada uno tiene un camino único al éxito.

¿Quieres descubrir el tuyo?

👉 Test de 2 minutos (gratuito): [LINK]

• Sin registro
• Resultado inmediato
• Guía personalizada

¿Qué tipo de anfitrión eres?
```

### Opción C: Post con Engagement (Comentarios)

```
PREGUNTA RÁPIDA para anfitriones 👇

¿Eres más de...?

A) Analizar datos y métricas
B) Crear sistemas y automatizar
C) Experiencias únicas e inolvidables
D) Actuar rápido y resolver al momento

Comenta tu letra.

Te diré qué tipo de anfitrión eres
(y qué te está frenando sin que lo sepas).

━━━━━━━━━━━━━━━━

[Después de varios comentarios, responder:]

"¡Wow! Muchas respuestas.

Para daros una evaluación más completa,
he creado un test de 2 minutos que identifica
vuestro perfil exacto (hay 8 tipos, no solo 4).

Os dice:
• Vuestras fortalezas únicas
• Puntos ciegos que os frenan
• Próximos pasos específicos

Es gratuito y no necesita registro.

👉 Aquí: [LINK]

¡Comentad qué arquetipo os sale!
Estoy curioso de ver la distribución."
```

---

## 🎯 PASO 2: Modificar el Test para Capturar Intereses

### Nuevas Preguntas al Final del Test

Después de las 16 preguntas actuales, agregar:

```tsx
// Nueva sección DESPUÉS de calcular arquetipo
// ANTES de pedir email

<div className="space-y-6">
  <h3 className="text-xl font-bold text-gray-900">
    Última pregunta: ¿En qué área necesitas más ayuda?
  </h3>

  <p className="text-gray-600">
    Selecciona hasta 3 áreas. Esto me ayudará a enviarte contenido específico para TI.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {interests.map((interest) => (
      <label
        key={interest.id}
        className={`
          flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer
          transition-all
          ${selectedInterests.includes(interest.id)
            ? 'border-violet-500 bg-violet-50'
            : 'border-gray-200 hover:border-violet-300'
          }
        `}
      >
        <input
          type="checkbox"
          checked={selectedInterests.includes(interest.id)}
          onChange={() => toggleInterest(interest.id)}
          disabled={
            !selectedInterests.includes(interest.id) &&
            selectedInterests.length >= 3
          }
          className="w-5 h-5 text-violet-600"
        />
        <div>
          <p className="font-medium text-gray-900">
            {interest.icon} {interest.title}
          </p>
          <p className="text-sm text-gray-600">
            {interest.description}
          </p>
        </div>
      </label>
    ))}
  </div>
</div>
```

### Opciones de Intereses:

```typescript
const interests = [
  {
    id: 'reviews',
    icon: '⭐',
    title: 'Conseguir reviews de 5 estrellas',
    description: 'Mejorar comunicación y experiencia del huésped'
  },
  {
    id: 'pricing',
    icon: '💰',
    title: 'Optimizar mis precios',
    description: 'Dynamic pricing y maximizar ingresos'
  },
  {
    id: 'occupancy',
    icon: '📈',
    title: 'Aumentar mi ocupación',
    description: 'Llenar más noches y reducir vacíos'
  },
  {
    id: 'automation',
    icon: '🤖',
    title: 'Automatizar tareas repetitivas',
    description: 'Reducir tiempo de gestión manual'
  },
  {
    id: 'communication',
    icon: '💬',
    title: 'Comunicación con huéspedes',
    description: 'Mensajes efectivos y respuestas rápidas'
  },
  {
    id: 'calendar',
    icon: '📅',
    title: 'Gestión de calendarios',
    description: 'Sincronización y disponibilidad'
  },
  {
    id: 'design',
    icon: '🎨',
    title: 'Creatividad y decoración',
    description: 'Hacer mi alojamiento más atractivo'
  },
  {
    id: 'legal',
    icon: '⚖️',
    title: 'Aspectos legales y fiscales',
    description: 'Licencias, impuestos, normativas'
  }
]
```

---

## 📧 PASO 3: Email Sequences Personalizados por Interés

### Estructura de Base de Datos (Actualizar schema.prisma)

```prisma
model EmailSubscriber {
  id                   String   @id @default(cuid())
  email                String   @unique
  name                 String?
  archetype            String?  // ESTRATEGA, SISTEMÁTICO, etc.

  // NUEVOS CAMPOS:
  interests            String[] // ['reviews', 'pricing', 'automation']
  topPriority          String?  // El primer interés seleccionado
  contentTrack         String?  // 'reviews_focused', 'automation_focused', etc.

  // ... resto de campos existentes
}
```

### Email Día 3: Contenido Específico por Interés

#### Si topPriority = 'reviews':

```
ASUNTO: "📧 Los 5 secretos para conseguir reviews de 5⭐ (que nadie te cuenta)"

Hola [Nombre],

Hace 3 días descubriste que eres un anfitrión [ARQUETIPO].

Y me dijiste que tu prioridad es conseguir mejores reviews.

Perfecto. Porque tengo algo para ti.

He analizado +1,000 reviews de 5 estrellas.
Y descubrí 5 patrones que TODOS tienen en común.

No es lo que crees (no es café gratis ni wifi rápido).

Es mucho más simple... y más poderoso.

👉 Lee el artículo completo aquí: [Link al blog]

En este artículo descubrirás:

✓ El "momento mágico" que garantiza una review de 5⭐
  (Pista: Ocurre en las primeras 2 horas)

✓ La "regla de las 3 comunicaciones"
  (Los anfitriones con +4.8★ siempre hacen esto)

✓ El error que cometen el 80% de anfitriones
  (Y que destruye reviews sin que lo sepas)

✓ La pregunta que NUNCA debes hacer
  (Aunque parezca lógica)

✓ Cómo convertir un problema en una review positiva
  (El "arte del recovery")

Esto me ha funcionado con cientos de propiedades.

Y va a funcionarte a ti.

Lee el artículo. Aplica UNA táctica hoy.

Y en 2 semanas me cuentas los resultados.

Un abrazo,
[Tu nombre]

PD: Si eres un [ARQUETIPO], hay un truco específico para ti
    al final del artículo. No te lo pierdas.
```

#### Si topPriority = 'pricing':

```
ASUNTO: "💰 RevPAR vs Ocupación: La métrica que cambiará tu negocio"

Hola [Nombre],

Pregunta rápida:

¿Prefieres...?

A) 90% ocupación a €50/noche = €1,350/mes
B) 70% ocupación a €85/noche = €1,785/mes

La mayoría elige A.

Porque "más ocupación = más dinero", ¿no?

ERROR.

La métrica que importa no es ocupación.
Es RevPAR (Revenue Per Available Room).

Y el 80% de anfitriones la desconoce.

👉 Lee esto: [Link al artículo RevPAR]

En este artículo aprenderás:

✓ Qué es RevPAR y cómo calcularlo
✓ Por qué ocupación alta ≠ más ingresos
✓ El "sweet spot" para tu propiedad
✓ Cómo optimizar precio sin perder reservas
✓ Casos reales de aumentos del 40%

Especialmente si eres [ARQUETIPO],
este enfoque va a resonar contigo.

Porque los datos no mienten.

Un abrazo,
[Tu nombre]

PD: Incluyo una calculadora de RevPAR gratuita
    al final del artículo.
```

#### Si topPriority = 'automation':

```
ASUNTO: "🤖 Las 47 tareas que puedes automatizar HOY en tu Airbnb"

Hola [Nombre],

Calcula cuántas horas trabajas por semana.

Ahora imagina recuperar el 60% de ese tiempo.

Sin perder calidad.
Sin perder control.
Sin perder dinero.

Es posible.

Y no necesitas ser ingeniero.

👉 Aquí está la lista completa: [Link]

He documentado 47 tareas que puedes automatizar:

📧 Comunicación (15 tareas)
   • Mensajes de bienvenida
   • Instrucciones de check-in
   • Recordatorios pre-llegada
   • Follow-ups post-estancia
   • ...

📅 Calendario (8 tareas)
   • Sincronización multi-plataforma
   • Bloqueos automáticos
   • Noches mínimas por temporada
   • ...

💰 Pricing (6 tareas)
   • Ajustes por temporada
   • Last-minute discounts
   • Precios por eventos
   • ...

🧹 Operaciones (12 tareas)
   • Coordinación de limpieza
   • Inventarios
   • Mantenimiento preventivo
   • ...

🎯 Marketing (6 tareas)
   • Request de reviews
   • Actualizaciones de listing
   • Respuestas a FAQs
   • ...

Cada tarea tiene:
✓ Nivel de dificultad
✓ Herramientas recomendadas
✓ Tiempo ahorrado por mes
✓ ROI estimado

Como [ARQUETIPO], algunas de estas
te van a encantar más que otras.

(Hay notas específicas para tu perfil)

Lee la guía. Implementa 3 automatizaciones esta semana.

Y me cuentas cuántas horas recuperaste.

Un abrazo,
[Tu nombre]

PD: Sorpresa al final: una plantilla lista
    para que copies y pegues en tus herramientas.
```

---

## 📚 PASO 4: Artículos de Blog Necesarios

### Categoría: Reviews (para interest = 'reviews')

1. **"Los 5 Secretos para Reviews de 5⭐"**
   - El momento mágico (primeras 2 horas)
   - Regla de las 3 comunicaciones
   - Errores que destruyen reviews
   - Pregunta prohibida
   - Arte del recovery

2. **"Caso Real: De 4.2★ a 4.9★ en 3 Meses"**
   - Storytelling de transformación
   - Qué cambió exactamente
   - Resultados medibles

3. **"El Checklist Definitivo para Reviews Perfectas"**
   - Antes de la llegada
   - Durante la estancia
   - Después del checkout

### Categoría: Pricing (para interest = 'pricing')

1. **"RevPAR vs Ocupación: La Métrica que Cambiará tu Negocio"** ✅
   - Ya está en el plan
   - Incluye calculadora

2. **"Dynamic Pricing: Guía Completa para Anfitriones"**
   - Qué es y cómo funciona
   - Herramientas recomendadas
   - Estrategia paso a paso

3. **"Caso Real: +40% de Ingresos con Mismo Trabajo"**
   - Estrategia de pricing implementada
   - Resultados mes a mes

### Categoría: Automation (para interest = 'automation')

1. **"47 Tareas Automatizables en tu Airbnb"** ✅
   - Ya está el PDF
   - Convertir a artículo web

2. **"Cómo Pasar de 12h/día a 8h/semana"**
   - Caso de Laura (EJECUTOR)
   - Sistemas implementados
   - Resultados

3. **"Stack Tecnológico del Anfitrión Moderno"**
   - Herramientas esenciales
   - Integraciones
   - Costos vs beneficios

### Categoría: Communication (para interest = 'communication')

1. **"Plantillas de Mensajes que Consiguen Reviews de 5⭐"**
   - Mensaje de confirmación
   - Pre-llegada
   - Check-in
   - Durante estancia
   - Post-checkout

2. **"Cómo Responder Mensajes en 5 Minutos (Sin Escribir)"**
   - Mensajes predefinidos
   - Variables dinámicas
   - Automatización inteligente

---

## 🎯 PASO 5: Introducción Gradual de Itineramio

### Email Día 10: Primera Mención (Sutil)

```
ASUNTO: "💡 La herramienta secreta que usé con Laura"

Hola [Nombre],

La semana pasada te conté el caso de Laura.

Pasó de:
❌ 12 horas/día, 68% ocupación, €2,100/mes
✅ 8 horas/semana, 89% ocupación, €3,850/mes

Varios me habéis preguntado:
"¿Cómo lo hizo exactamente?"

Déjame contarte el secreto.

Laura es anfitriona EJECUTORA (como quizás tú).

Su problema era la comunicación:
• Respondía mensajes 24/7
• Explicaba check-in 50 veces por mes
• Enviaba instrucciones por WhatsApp
• Los huéspedes le preguntaban TODO

Entonces implementamos algo simple:

Un manual digital interactivo para cada propiedad.

Nada de PDFs.
Nada de imprimir.
Nada manual.

Un QR en la puerta.
Los huéspedes escanean.
Ven TODO: check-in, wifi, normas, recomendaciones.

Resultado:
✓ 80% menos preguntas repetitivas
✓ 0 llamadas durante las estancias
✓ Mejor experiencia del huésped (= reviews de 5⭐)
✓ Laura recuperó 15 horas/semana

Ahora bien...

Puedes hacer esto manualmente:
- Crear un Google Doc
- Diseñarlo bonito
- Generar un QR
- Actualizarlo cada vez que cambies algo

O puedes usar la herramienta que creé
específicamente para esto:

👉 Itineramio: Manuales digitales en 5 minutos

Sin diseño. Sin esfuerzo. Sin complicaciones.

Mira cómo funciona: [Link a landing]

Y si te interesa probarlo, tienes 15 días gratuitos.

Sin tarjeta. Sin compromiso.

Pero...

Antes de eso, déjame preguntarte:

¿Este tema de manuales digitales resuena contigo?

O prefieres que te siga enviando contenido sobre [TU TOP PRIORITY]?

Responde este email y cuéntame.

Quiero enviarte lo que TE sirve.

Un abrazo,
[Tu nombre]

PD: Si no te interesa Itineramio, no pasa nada.
    Seguiré compartiendo contenido de valor contigo.
    Zero presión.
```

### Email Día 14: Caso de Éxito con Itineramio

```
ASUNTO: "📊 Resultados reales: 127 anfitriones usando Itineramio"

Hola [Nombre],

Te voy a compartir datos.

Porque sé que los números no mienten.

He analizado a los primeros 127 anfitriones
que usan Itineramio hace +3 meses.

Aquí están los resultados promedio:

⏰ TIEMPO AHORRADO:
• Antes: 12.3 horas/semana en comunicación
• Después: 3.7 horas/semana
• Ahorro: 8.6 horas/semana (70%)

📧 MENSAJES REDUCIDOS:
• Antes: 47 mensajes por reserva
• Después: 11 mensajes por reserva
• Reducción: 76%

⭐ IMPACTO EN REVIEWS:
• 89% reportan mejora en reviews
• Rating promedio subió de 4.6 a 4.8
• Reviews mencionando "comunicación clara" +340%

💰 ROI:
• Costo: €19/mes (HOST) o €9/mes (BASIC)
• Tiempo ahorrado valorado en: ~€300/mes
• ROI: 1,578% (si valoras tu tiempo en €15/hora)

Y aquí está la parte más importante:

El 94% lo siguen usando después del trial.

¿Por qué?

Porque funciona.

Simple.

Ahora, la pregunta es:

¿Estás listo para probar?

👉 Empieza tu evaluación de 15 días (sin tarjeta)

[BOTÓN: PROBAR ITINERAMIO GRATIS]

O si prefieres, responde este email
con tus dudas y te las resuelvo personalmente.

Un abrazo,
[Tu nombre]

PD: Como eres [ARQUETIPO], Itineramio te va a gustar
    especialmente porque [RAZÓN ESPECÍFICA POR ARQUETIPO].

    Por ejemplo:
    - ESTRATEGA: "Tienes dashboard con métricas de engagement"
    - SISTEMÁTICO: "Todo es automatizable y escalable"
    - EJECUTOR: "Creas manuales en 5 minutos, sin diseño"
```

---

## 📊 PASO 6: Tracking y Optimización

### UTM Parameters para el Post de Facebook

```
https://itineramio.com/host-profile/test?
  source=facebook
  &medium=group
  &campaign=arquetipo_anfitrion
  &group_name=[nombre_del_grupo]
```

### Métricas a Medir

**Fase 1: Adquisición (Facebook → Test)**
- Clics en el post
- Tasa de clic (CTR)
- Tests iniciados
- Tests completados

**Fase 2: Conversión (Test → Email)**
- % que proporciona email
- Distribución de arquetipos
- Distribución de intereses (top 3)

**Fase 3: Engagement (Emails)**
- Open rate por interés
- Click-through rate por artículo
- Descargas de PDF

**Fase 4: Conversión Final**
- Clics en "Probar Itineramio"
- Registros para trial
- Conversión de trial a pago

---

## 🎯 Resumen: Plan de Acción Inmediato

### Semana 1:
- [ ] Modificar test para capturar intereses
- [ ] Actualizar schema de Prisma (interests, topPriority)
- [ ] Crear post de Facebook (3 variaciones)

### Semana 2:
- [ ] Escribir Email Día 3 (versión por cada interés)
- [ ] Escribir 2 artículos de blog prioritarios
- [ ] Publicar post en grupos de Facebook

### Semana 3:
- [ ] Monitorear métricas del post
- [ ] Escribir Email Día 7 (casos de éxito por interés)
- [ ] Escribir 2 artículos más

### Semana 4:
- [ ] Email Día 10 (primera mención de Itineramio)
- [ ] Email Día 14 (caso de éxito con Itineramio)
- [ ] Optimizar lo que no funciona
