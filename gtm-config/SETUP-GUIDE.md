# Guía de Configuración GTM para Itineramio

## Paso 0: Obtener GA4 Measurement ID

1. Ve a [analytics.google.com](https://analytics.google.com)
2. Crea una propiedad GA4 para Itineramio (si no existe)
3. Ve a **Admin** → **Data Streams** → **Web**
4. Copia el **Measurement ID** (formato: `G-XXXXXXXXX`)

---

## Paso 1: Crear la Tag de Configuración GA4

1. En GTM, ve a **Tags** → **New**
2. Nombre: `GA4 - Configuration`
3. Tipo: **Google Analytics: GA4 Configuration**
4. Measurement ID: `G-XXXXXXXXX` (el que obtuviste en Paso 0)
5. Trigger: **All Pages**
6. Guardar

---

## Paso 2: Crear Variables de Data Layer

Crea estas variables en **Variables** → **User-Defined Variables** → **New**:

| Nombre Variable | Tipo | Data Layer Variable Name |
|-----------------|------|-------------------------|
| DLV - calc_zone | Data Layer Variable | calc_zone |
| DLV - calc_model | Data Layer Variable | calc_model |
| DLV - calc_properties | Data Layer Variable | calc_properties |
| DLV - calc_result | Data Layer Variable | calc_result |
| DLV - calc_margin | Data Layer Variable | calc_margin |
| DLV - source | Data Layer Variable | source |
| DLV - lead_magnet | Data Layer Variable | lead_magnet |
| DLV - value | Data Layer Variable | value |
| DLV - resource_name | Data Layer Variable | resource_name |
| DLV - resource_type | Data Layer Variable | resource_type |
| DLV - article_slug | Data Layer Variable | article_slug |
| DLV - method | Data Layer Variable | method |

Para cada una:
1. **New** → Nombre de la variable
2. Tipo: **Data Layer Variable**
3. Data Layer Variable Name: el nombre sin el prefijo "DLV - "
4. Data Layer Version: **Version 2**

---

## Paso 3: Crear Triggers (Disparadores)

Crea estos triggers en **Triggers** → **New**:

### 3.1 CE - calculator_used
- Tipo: **Custom Event**
- Event name: `calculator_used`

### 3.2 CE - generate_lead
- Tipo: **Custom Event**
- Event name: `generate_lead`

### 3.3 CE - lead_magnet_downloaded
- Tipo: **Custom Event**
- Event name: `lead_magnet_downloaded`

### 3.4 CE - sign_up
- Tipo: **Custom Event**
- Event name: `sign_up`

### 3.5 CE - purchase
- Tipo: **Custom Event**
- Event name: `purchase`

---

## Paso 4: Crear Tags de Eventos GA4

### 4.1 GA4 - Event - calculator_used

1. **New Tag** → Nombre: `GA4 - Event - calculator_used`
2. Tipo: **Google Analytics: GA4 Event**
3. Configuration Tag: `GA4 - Configuration`
4. Event Name: `calculator_used`
5. Event Parameters:
   | Parameter Name | Value |
   |---------------|-------|
   | calc_zone | {{DLV - calc_zone}} |
   | calc_model | {{DLV - calc_model}} |
   | calc_properties | {{DLV - calc_properties}} |
   | calc_result | {{DLV - calc_result}} |
   | calc_margin | {{DLV - calc_margin}} |
6. Trigger: `CE - calculator_used`

### 4.2 GA4 - Event - generate_lead

1. **New Tag** → Nombre: `GA4 - Event - generate_lead`
2. Tipo: **Google Analytics: GA4 Event**
3. Configuration Tag: `GA4 - Configuration`
4. Event Name: `generate_lead`
5. Event Parameters:
   | Parameter Name | Value |
   |---------------|-------|
   | source | {{DLV - source}} |
   | lead_magnet | {{DLV - lead_magnet}} |
   | value | {{DLV - value}} |
6. Trigger: `CE - generate_lead`

### 4.3 GA4 - Event - lead_magnet_downloaded

1. **New Tag** → Nombre: `GA4 - Event - lead_magnet_downloaded`
2. Tipo: **Google Analytics: GA4 Event**
3. Configuration Tag: `GA4 - Configuration`
4. Event Name: `lead_magnet_downloaded`
5. Event Parameters:
   | Parameter Name | Value |
   |---------------|-------|
   | resource_name | {{DLV - resource_name}} |
   | resource_type | {{DLV - resource_type}} |
   | article_slug | {{DLV - article_slug}} |
6. Trigger: `CE - lead_magnet_downloaded`

### 4.4 GA4 - Event - sign_up

1. **New Tag** → Nombre: `GA4 - Event - sign_up`
2. Tipo: **Google Analytics: GA4 Event**
3. Configuration Tag: `GA4 - Configuration`
4. Event Name: `sign_up`
5. Event Parameters:
   | Parameter Name | Value |
   |---------------|-------|
   | method | {{DLV - method}} |
6. Trigger: `CE - sign_up`

### 4.5 GA4 - Event - purchase

1. **New Tag** → Nombre: `GA4 - Event - purchase`
2. Tipo: **Google Analytics: GA4 Event**
3. Configuration Tag: `GA4 - Configuration`
4. Event Name: `purchase`
5. Send Ecommerce Data: ✅ Enabled
6. Trigger: `CE - purchase`

---

## Paso 5: Configurar Conversiones en GA4

Una vez publicado GTM, ve a GA4:

1. **Admin** → **Events**
2. Marca como conversión:
   - `generate_lead` ⭐
   - `sign_up` ⭐
   - `purchase` ⭐
   - `calculator_used` (opcional)

---

## Paso 6: Preview y Publicar

1. En GTM, click **Preview**
2. Abre https://itineramio.com en la ventana de debug
3. Usa la calculadora y verifica que `calculator_used` aparece
4. Si todo OK, click **Submit** → **Publish**

---

## Verificación

Después de publicar:
1. Ve a GA4 → **Realtime**
2. Usa la calculadora en itineramio.com
3. Deberías ver el evento `calculator_used` en tiempo real

---

## Eventos Implementados en el Código

| Evento | Ubicación | Cuándo se dispara |
|--------|-----------|-------------------|
| `calculator_used` | Calculadora de rentabilidad | Al calcular |
| `generate_lead` | Calculadora + Lead magnets | Al capturar email |
| `lead_magnet_downloaded` | Página de descarga PDFs | Al descargar PDF |
| `sign_up` | Registro | Al crear cuenta |
| `purchase` | Checkout | Al completar pago |

