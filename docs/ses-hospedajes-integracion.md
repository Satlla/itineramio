# Reporte: Integración SES.Hospedajes en Itineramio

Fecha: 2026-04-14

---

## 1. ARQUITECTURA TÉCNICA

### Dos opciones de integración:

**Opción A — Directo con el Ministerio (recomendada):**
- Web Service **SOAP/XML** oficial
- Producción: `https://hospedajes.ses.mir.es/hospedajes-web/ws/v1/comunicacion`
- Sandbox: `https://hospedajes.pre-ses.mir.es/hospedajes-web/ws/v1/comunicacion`
- Auth: HTTP Basic + certificado SSL del Ministerio
- [Especificaciones WS v3.1.2 (PDF)](https://seshospedajes.es/wp-content/uploads/2024/12/MIR-HOSPE-DSI-WS-Servicio-de-Hospedajes-Comunicaciones-v3.1.2.pdf)
- [Instrucciones carga masiva (PDF)](https://hospedajes.ses.mir.es/hospedajes-sede/assets/docs/Instrucciones.pdf)
- [Validador XML gratuito](https://seshospedajes.es/en/validar-xml-gratis/)

**Opción B — Via seshospedajes.es (intermediario privado):**
- API REST con JSON
- Auth: `X-Api-Key` en header
- Requiere plan Premium
- [Docs API](https://seshospedajes.es/app/api/docs/index.html)

### Proceso de alta como integrador:

1. Acceder a https://hospedajes.ses.mir.es/hospedajes-sede/
2. Autenticarse con certificado digital, Cl@ve PIN o Cl@ve Móvil
3. Rellenar datos del establecimiento
4. Marcar "Envío de comunicaciones por servicio web"
5. Recibir por email: usuario, password, código de arrendador, código de establecimiento
6. Importar certificado SSL del Ministerio en truststore
7. Probar en entorno de pre-producción

---

## 2. DATOS OBLIGATORIOS POR HUÉSPED (RD 933/2021)

### Datos del viajero:

| Campo | Obligatorio | Notas |
|-------|-------------|-------|
| Nombre | Sí | |
| Primer apellido | Sí | |
| Segundo apellido | Sí | Si aplica |
| Sexo | Sí | |
| Número de documento | Sí | DNI/NIE/Pasaporte |
| **Número de soporte** | Sí | **Campo más problemático** — 3 chars del reverso del DNI |
| Tipo de documento | Sí | DNI, Pasaporte, TIE |
| Nacionalidad | Sí | |
| Fecha de nacimiento | Sí | |
| Residencia habitual | Sí | Dirección completa |
| Teléfono | Sí | Al menos uno (fijo o móvil) |
| Correo electrónico | Sí | |
| Número de viajeros | Sí | |
| Parentesco | Sí* | *Solo menores de 14 años |

### Datos de la transacción:

| Campo | Obligatorio |
|-------|-------------|
| Referencia del contrato | Sí |
| Fecha del contrato | Sí |
| Fecha y hora de entrada | Sí |
| Fecha y hora de salida | Sí |
| Tipo de pago | Sí |
| Datos de tarjeta/IBAN | Sí (si aplica) |
| Titular del medio de pago | Sí (si aplica) |
| Fecha del pago | Sí |

### Plazos:
- **24 horas** desde confirmación de reserva o inicio del servicio
- **Conservación**: mínimo 3 años

---

## 3. DIFERENCIAS POR COMUNIDAD AUTÓNOMA

| Territorio | Cuerpo policial | Sistema | Notas |
|-----------|----------------|---------|-------|
| España general | Guardia Civil / Policía Nacional | **SES.HOSPEDAJES** | Unificado desde Oct 2024 |
| **Cataluña** | Mossos d'Esquadra | Sistema propio | Sin API, validaciones más estrictas |
| **País Vasco** | Ertzaintza | Sistema propio | Canal diferente |

### Registros turísticos autonómicos:

| CCAA | Código | Requisitos adicionales |
|------|--------|----------------------|
| Cataluña | HUTB-XXXXXX | Cédula habitabilidad, certificado energético, seguro RC |
| Baleares | Variable | La más restrictiva: solo zonas autorizadas |
| C. Valenciana | VT-XXXXXX-XX | Certificado compatibilidad urbanística |
| Andalucía | VUT/XX/XXXXX | Referencia catastral, hojas reclamaciones |
| País Vasco | Variable | Licencias municipales adicionales |

### Desde julio 2025:
- **Número de Registro Único de Alquiler (NRUA/NRA)** obligatorio para todos los anuncios en plataformas digitales (RD 1312/2024)

---

## 4. IMPLICACIONES LEGALES

### Responsabilidad:
- **El sujeto obligado es el gestor/propietario**, NO Itineramio
- Itineramio sería **encargado del tratamiento** (art. 28 RGPD)
- Si el sistema falla → multa para el gestor, pero puede reclamar a Itineramio por daños

### Régimen sancionador:

| Infracción | Multa | Prescripción |
|---|---|---|
| Envío tardío / datos incompletos | 100 - 600€ | 6 meses |
| Omisión total del registro | 601 - 30.000€ | 1 año |
| Escanear/fotocopiar DNI completo | 5.400 - 70.000€ | — |
| No notificar brecha de datos (RGPD) | Hasta 10M€ o 2% facturación | — |
| No hacer DPIA cuando es obligatoria | 40.001 - 300.000€ | — |

### RGPD — Obligaciones:

1. **Contrato de Encargado del Tratamiento (DPA)** con cada gestor — obligatorio
2. **DPIA** — muy probablemente obligatoria por tratar DNIs/pasaportes a gran escala
3. **Base legal**: obligación legal (art. 6.1.c) — NO necesita consentimiento del huésped
4. **Retención**: máximo 3 años, luego eliminar
5. **NUNCA almacenar imágenes de documentos** — solo extraer campos y descartar
6. **Cifrado** en tránsito (TLS) y en reposo (AES-256)
7. **Seguro de ciberriesgos** antes de lanzar
8. **Registro de Actividades de Tratamiento (RAT)** interno obligatorio

### OCR y verificación de documentos:
- Es legal usar OCR si NO se almacena la imagen completa
- Solo extraer campos específicos del Anexo I del RD 933/2021
- No existe certificación obligatoria, pero ISO 27001 recomendable
- **EVITAR biometría facial** — alto riesgo regulatorio, poco beneficio

### Documentación legal necesaria:
1. **ToS actualizado** con cláusula de limitación de responsabilidad (modelo Partee: últimos 2 meses)
2. **DPA** como anexo al ToS, aceptable electrónicamente en onboarding
3. **Política de privacidad** actualizada (para gestores y template para huéspedes)
4. **DPIA** documentada y archivada antes del lanzamiento

---

## 5. COMPETIDORES

| Competidor | Precio | Qué incluye |
|---|---|---|
| **Partee** | desde 1€/mes por establecimiento | Check-in online, OCR, envío automático SES/Mossos/Ertzaintza |
| **CheckinScan** | desde 6,95€/mes | App OCR, formulario, envío automático |
| **Chekin** | consultar (prueba 14 días) | Check-in, OCR, biometría, firma digital, envío automático |
| **seshospedajes.es** | Plan Premium | API REST, servicio comercial intermediario |

### PMS con integración nativa:
- Net2Rent, Avantio, Cloudbeds (via Civitfun), Lodgify (via Chekin/CheckinScan)

---

## 6. ERRORES COMUNES

- **Número de soporte DNI**: 3 chars del reverso, mayor tasa de error OCR
- **Apóstrofes y símbolos**: Mossos no los acepta en campos de texto
- **Teléfonos**: usar `00` en lugar de `+`, sin espacios ni guiones
- **Documentos**: sin guiones entre número e identificador
- **Letras del soporte**: siempre en MAYÚSCULAS

---

## 7. PLAZOS ESTIMADOS

| Fase | Tiempo | Detalle |
|---|---|---|
| Alta en SES.Hospedajes + credenciales | 1-2 semanas | Registro con certificado digital |
| Desarrollo formulario check-in | 2-3 semanas | Todos los campos del RD 933/2021 |
| Integración SOAP/XML con SES | 2-3 semanas | Cliente SOAP, validación XSD |
| Pruebas en sandbox | 1-2 semanas | Envíos de prueba |
| DPIA + documentación legal | 2-3 semanas | Evaluación de impacto, DPA, ToS |
| Soporte Mossos/Ertzaintza | 2-4 semanas | Sistemas separados |
| **Total MVP (solo SES)** | **~8-10 semanas** | Sin Mossos/Ertzaintza |
| **Total completo** | **~12-14 semanas** | Con las 3 policías |

---

## 8. RIESGOS

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Sistema SES caído | Alto | Reintentos automáticos + alerta al gestor |
| OCR falla con soporte DNI | Alto | Corrección manual siempre disponible |
| Brecha de seguridad | Crítico | Cifrado E2E, no almacenar imágenes, seguro ciber |
| Gestor reclama por multa | Medio | Cláusula limitación responsabilidad en ToS |
| Cataluña/País Vasco distintos | Medio | Detectar CCAA automáticamente |
| Inspección AEPD | Medio | DPIA hecha, DPA firmados, sin fotos documentos |

---

## 9. PLAN DE FASES

**Fase 1 (MVP):** Integración directa con SES.Hospedajes. Formulario check-in dentro de Itineramio → envío SOAP al Ministerio. Sin OCR, datos manuales. Solo España peninsular (sin Cataluña/País Vasco).

**Fase 2:** OCR para escanear documentos (extraer datos, descartar imagen). Soporte Mossos y Ertzaintza.

**Fase 3:** Integración con Yacan/cerraduras inteligentes (código temporal activado a la hora del check-in).

---

## FUENTES PRINCIPALES

- [BOE - Real Decreto 933/2021](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2021-17461)
- [SES.Hospedajes - Portal Ministerio](https://hospedajes.ses.mir.es/hospedajes-sede/)
- [Especificaciones WS v3.1.2](https://seshospedajes.es/wp-content/uploads/2024/12/MIR-HOSPE-DSI-WS-Servicio-de-Hospedajes-Comunicaciones-v3.1.2.pdf)
- [API Docs seshospedajes.es](https://seshospedajes.es/app/api/docs/index.html)
- [AEPD - Comunicado sobre alojamientos turísticos](https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/comunicado-registro-de-datos-de-ciudadanos-por-alojamientos-turisticos)
- [AEPD - No permitido solicitar copia DNI](https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-informa-de-que-no-esta-permitido-solicitar-copia-dni-o-pasaporte-en-hospedajes)
- [Partee - Condiciones Conector Policial](https://partee.es/condiciones-del-servicio-conector-policial/)
- [Chekin - Política privacidad alojamientos](https://chekin.com/politica-de-privacidad-generica-de-los-alojamientos/)
- [Yacan Smart Security](https://www.yacan.es/)
- [Yacan Marketplace](https://www.yacan.es/marketplace/)
