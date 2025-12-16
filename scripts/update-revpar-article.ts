import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const newContent = `
<div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
<p style="font-weight: 700; margin: 0 0 0.5rem 0; color: #166534;">TL;DR (en 30 segundos)</p>
<p style="margin: 0; color: #166534;">RevPAR = ADR × Ocupación. Pero lo que importa es el RevPAR <em>neto</em> (después de costes). Un 70% de ocupación a 95€ te deja más que un 90% a 65€. Usa el framework de abajo para calcularlo con tus números reales.</p>
</div>

<p class="lead">Por qué un 90% de ocupación puede ser buena noticia… o una señal de que estás dejando dinero encima de la mesa.</p>

<p>Si llevas un Airbnb (o un piso turístico), es normal mirar el calendario y pensar: "si está lleno, voy bien". La ocupación ayuda, claro. El problema es cuando se convierte en <em>la</em> métrica.</p>

<p>Porque la ocupación solo responde a una parte de la pregunta. Te dice "cuántas noches vendes", pero no te dice "cuánto rendimiento sacas por cada noche que podrías vender".</p>

<p><strong>Ahí es donde RevPAR te pone los pies en el suelo.</strong></p>

<h2>Un ejemplo rápido (y típico)</h2>

<p>Dos apartamentos parecidos (misma zona, capacidad y calidad):</p>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 2rem 0;">
<div style="background: #fef2f2; border-radius: 12px; padding: 1.5rem;">
<p style="font-weight: 700; margin: 0 0 1rem 0; color: #dc2626;">Apartamento A</p>
<p style="margin: 0 0 0.5rem 0;">Ocupación: 90%</p>
<p style="margin: 0 0 0.5rem 0;">Precio medio (ADR): 65€</p>
<p style="margin: 0; font-weight: 700;">Ingresos: 30 × 0,90 × 65 = 1.755€/mes</p>
</div>
<div style="background: #f0fdf4; border-radius: 12px; padding: 1.5rem;">
<p style="font-weight: 700; margin: 0 0 1rem 0; color: #22c55e;">Apartamento B</p>
<p style="margin: 0 0 0.5rem 0;">Ocupación: 70%</p>
<p style="margin: 0 0 0.5rem 0;">ADR: 95€</p>
<p style="margin: 0; font-weight: 700;">Ingresos: 30 × 0,70 × 95 = 1.995€/mes</p>
</div>
</div>

<p><strong>B ingresa 240€ más al mes con menos noches ocupadas.</strong></p>

<p>No es magia. Es pricing y mezcla de demanda. El calendario lleno no siempre significa "bien vendido".</p>

<h2>Tres conceptos (para no mezclar cosas)</h2>

<ul>
<li><strong>Ocupación (%):</strong> noches vendidas / noches disponibles</li>
<li><strong>ADR (precio medio):</strong> ingresos por alojamiento / noches vendidas</li>
<li><strong>RevPAR:</strong> ingresos por alojamiento / noches disponibles</li>
</ul>

<div style="background: #ede9fe; border-radius: 12px; padding: 2rem; margin: 2rem 0; text-align: center;">
<p style="font-size: 1.5rem; font-weight: 700; margin: 0; color: #5b21b6;">RevPAR = ADR × Ocupación</p>
</div>

<p>Esto es muy práctico porque te dice de dónde viene el problema:</p>

<ul>
<li><strong>Ocupación alta + RevPAR flojo</strong> → normalmente precio bajo (o descuentos demasiado agresivos)</li>
<li><strong>ADR alto + RevPAR flojo</strong> → normalmente ocupación insuficiente (o reglas que te dejan huecos)</li>
<li><strong>RevPAR sube aunque ocupes menos</strong> → suele ser una optimización sana si no estás rompiendo conversión</li>
</ul>

<h2>Ojo: RevPAR es ingresos. Tú vives del neto</h2>

<p>En alquiler vacacional, RevPAR "clásico" (ingreso bruto por noche disponible) se queda corto si lo usas para decidir sin mirar costes.</p>

<p>Por eso conviene trabajar con dos números:</p>

<ul>
<li><strong>RevPAR (bruto)</strong> para saber si estás monetizando bien la demanda</li>
<li><strong>Net RevPAN / "RevPAR neto"</strong> (neto por noche disponible) para saber si te queda dinero después de comisiones, gestión, limpieza, consumos, etc.</li>
</ul>

<p>No hace falta complicarse con nomenclatura hotelera. La idea es: <em>ingresos por noche disponible</em> vs <em>beneficio por noche disponible</em>.</p>

<h2>Metodología (para que el cálculo sea "de verdad")</h2>

<p>Esto es lo que suele separar un KPI útil de un número bonito.</p>

<h3>1) Qué ingresos incluyes (y por qué)</h3>

<p>Define un criterio y sé consistente:</p>

<ul>
<li><strong>Alojamiento (tarifa por noche):</strong> normalmente sí</li>
<li><strong>Limpieza:</strong> puedes incluirla o no, pero decide una regla. Si la limpieza es un "pass-through" (cobras 80 y pagas 80), incluirla infla ingresos sin decir nada del margen</li>
<li><strong>Extras (late check-out, cuna, etc.):</strong> igual, con criterio fijo</li>
</ul>

<p><em>Mi recomendación:</em> separa "ingreso por noches" (para RevPAR clásico) y trata la limpieza aparte en el neto.</p>

<h3>2) Qué significa "noches disponibles"</h3>

<p>En Airbnb, "disponible" puede ser engañoso si bloqueas noches o tienes reglas que en la práctica hacen ciertas noches invendibles.</p>

<p>Yo usaría dos capas:</p>

<p><strong>A. Noches calendario (techo máximo)</strong><br>Todas las noches del mes (30/31).</p>

<p><strong>B. Noches comercialmente disponibles (real)</strong><br>Noches que realmente podrías vender con tus reglas actuales. Aquí puedes excluir:</p>
<ul>
<li>Bloqueos por uso propio / mantenimiento</li>
<li>Noches que quedan "muertas" por restricciones (p. ej., min. estancia rígida que crea huecos)</li>
</ul>

<p><strong>Lo importante:</strong> usa siempre la misma definición para comparar mes a mes.</p>

<h3>3) Cómo montar tu set competitivo (sin perderte)</h3>

<p>El comp set no es "los pisos más bonitos". Es "los que un huésped razonable compararía contigo".</p>

<p><strong>Checklist rápido:</strong></p>
<ul>
<li>Misma zona o microzona (no "Barcelona", sino el barrio y su borde real)</li>
<li>Misma capacidad (huéspedes) y número de habitaciones</li>
<li>Amenities clave comparables (ascensor sí/no, terraza, parking, A/C, etc.)</li>
<li>Rango de reviews similar (no te compares con un 4,95 con 800 reseñas si tú estás empezando)</li>
</ul>

<p><strong>Cuántos:</strong> 5–10 es suficiente si son comparables de verdad.<br>
<strong>Qué mirar:</strong> precios por día de semana, política de cancelación, estancia mínima, disponibilidad futura (pickup) y estacionalidad.</p>

<h2>Cómo usar RevPAR sin caer en "sube precios y ya"</h2>

<p>Aquí van tres palancas, pero con el matiz de cómo medir si funcionan.</p>

<h3>Palanca 1: Precio (impacto alto)</h3>

<p>En lugar de "sube 10%", piensa así:</p>

<ol>
<li>Elige 2–3 ventanas donde sabes que hay demanda (fines de semana, eventos, puentes)</li>
<li>Sube de forma controlada (5–10%)</li>
<li>Mira durante 2–3 semanas:
<ul>
<li>RevPAR (bruto)</li>
<li>Pickup (cómo se llena el calendario a 14/30/60 días vista)</li>
<li>Duración media de estancia y huecos</li>
</ul>
</li>
</ol>

<p><strong>Si RevPAR sube y el pickup no se desploma, vas bien.</strong></p>

<h3>Palanca 2: Conversión del anuncio (impacto medio-alto)</h3>

<p>Si mejoras conversión, puedes sostener un ADR mayor sin sacrificar ocupación.</p>

<p><strong>Lo que de verdad mueve la aguja:</strong></p>
<ul>
<li><strong>Fotos:</strong> orden, luz, secuencia lógica y foco en diferenciales reales</li>
<li><strong>Texto:</strong> beneficios concretos + expectativas claras (incluye "lo malo" con naturalidad; reduce devoluciones y quejas)</li>
<li><strong>Menos fricción:</strong> reglas y requisitos razonables</li>
</ul>

<h3>Palanca 3: Huecos y reglas (impacto medio)</h3>

<p>Muchos calendarios "buenos" están llenos de huecos invendibles.</p>

<ul>
<li>Estancia mínima flexible en baja</li>
<li>Reglas de llegada (check-in) para evitar huecos de 1 noche</li>
<li>Descuentos con intención: última hora para inventario muerto, semanal/mensual si de verdad reduce rotación (y costes)</li>
</ul>

<h2>Mini-framework práctico: de KPI a plan (con números)</h2>

<p>La idea es que, en 20 minutos, puedas responder:</p>
<ol>
<li>¿Cuál es mi rendimiento bruto por noche disponible?</li>
<li>¿Cuál es mi rendimiento neto (lo que me queda)?</li>
<li>¿Qué palanca tiene más impacto con menor riesgo?</li>
</ol>

<h3>Paso 1 — Rellena tus inputs del mes</h3>
<ul>
<li>Noches del mes</li>
<li>Ocupación</li>
<li>ADR</li>
<li>Estancia media (LOS)</li>
<li>Comisión plataforma (tu realidad)</li>
<li>% gestión (si aplica)</li>
<li>Coste limpieza (lo que pagas)</li>
<li>Consumibles/utilities estimados</li>
</ul>

<h3>Paso 2 — Calcula 4 salidas</h3>
<ul>
<li>Noches ocupadas</li>
<li>RevPAR (bruto)</li>
<li>Ingreso bruto mensual</li>
<li>Neto mensual aproximado</li>
<li>(opcional) Neto por noche disponible</li>
</ul>

<h3>Ejemplo comparativo</h3>

<div style="overflow-x: auto; margin: 2rem 0;">
<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
<thead>
<tr style="background: #f3f4f6;">
<th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #e5e7eb;">Variable</th>
<th style="padding: 0.75rem; text-align: right; border-bottom: 2px solid #e5e7eb;">Antes</th>
<th style="padding: 0.75rem; text-align: right; border-bottom: 2px solid #e5e7eb;">Después</th>
</tr>
</thead>
<tbody>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;">Noches del mes</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">30</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">30</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;">Ocupación</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">85%</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">72%</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;">ADR (€)</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">55</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">78</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;">Estancia media (noches)</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">3,0</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">3,0</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;">Noches ocupadas</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">25,5</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">21,6</td></tr>
<tr style="background: #f0fdf4;"><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; font-weight: 600;">RevPAR (ADR×Occ)</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">46,75€</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">56,16€</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;">Limpiezas (nº estancias aprox.)</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">8,5</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">7,2</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb;">Ingreso noches (bruto)</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">1.402,50€</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">1.684,80€</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Comisión plataforma (%)*</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">15%</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">15%</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Gestión (%)*</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">20%</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">20%</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Coste limpieza por estancia (€)*</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">55</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">55</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Utilities/consumos fijos (€)*</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">180</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">180</td></tr>
<tr><td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Consumibles por noche (€)*</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">2,5</td><td style="padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e5e7eb;">2,5</td></tr>
<tr style="background: #ecfdf5;"><td style="padding: 0.75rem; font-weight: 700; color: #059669;">Neto mensual aprox.</td><td style="padding: 0.75rem; text-align: right; font-weight: 700; color: #059669;">642,38€</td><td style="padding: 0.75rem; text-align: right; font-weight: 700; color: #059669;">839,52€</td></tr>
<tr style="background: #ecfdf5;"><td style="padding: 0.75rem; font-weight: 700; color: #059669;">Neto por noche disponible</td><td style="padding: 0.75rem; text-align: right; font-weight: 700; color: #059669;">21,41€</td><td style="padding: 0.75rem; text-align: right; font-weight: 700; color: #059669;">27,98€</td></tr>
</tbody>
</table>
</div>

<p style="font-size: 0.85rem; color: #6b7280;">* Son inputs: pon tus porcentajes y costes reales.</p>

<h3>Qué te enseña este framework</h3>

<ul>
<li>Aunque baja la ocupación, el RevPAR sube (mejor monetización)</li>
<li>Y lo más importante: <strong>el neto también sube</strong>, porque no solo cobras más por noche, también reduces rotación (menos limpiezas) y costes variables por noches ocupadas</li>
</ul>

<div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; padding: 2.5rem; margin: 2.5rem 0; text-align: center; color: white;">
<h3 style="margin-top: 0; font-size: 1.5rem; font-weight: 700;">Calcula tu RevPAR real</h3>
<p style="font-size: 1rem; margin: 1rem 0 1.5rem 0; opacity: 0.9;">Usa nuestra calculadora de rentabilidad para aplicar este framework con tus datos reales y ver tu potencial de ingresos.</p>
<a href="/hub/calculadora-rentabilidad" style="display: inline-block; background: white; color: #6366f1; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 700;">Usar calculadora de rentabilidad →</a>
</div>

<h2>Señales de que vas demasiado lleno (y quizá barato)</h2>

<p>No es una ciencia exacta, pero si te pasan varias de estas, merece revisión:</p>

<ul>
<li>Te reservan con mucha antelación incluso en semanas "normales"</li>
<li>Los fines de semana se venden siempre sin resistencia</li>
<li>Casi nunca llegas al último minuto con inventario</li>
<li>Cuando subes precio un poco, no notas caída en conversión</li>
</ul>

<p>Eso normalmente no significa "lo estoy haciendo perfecto". Muchas veces significa: <strong>hay margen</strong>.</p>

<h2>Plan de acción (simple y realista)</h2>

<h3>Semana 1</h3>
<p>Calcula RevPAR y neto por noche disponible de los últimos 2–3 meses. Separa entre semana vs fin de semana.</p>

<h3>Semana 2</h3>
<p>Monta comp set (5–10) y revisa precios por día de semana a 30/60 días vista.</p>

<h3>Semanas 3–4</h3>
<p>Haz 1 test controlado (no diez cambios a la vez):</p>
<ul>
<li>Ajuste de precio en días concretos, o</li>
<li>Ajuste de estancia mínima para reducir huecos, o</li>
<li>Mejora de anuncio enfocada a conversión</li>
</ul>

<p><strong>Evalúa con RevPAR + pickup + neto.</strong></p>

<h2>Artículos Relacionados</h2>

<ul>
<li><a href="/blog/caso-laura-de-1800-a-3200-euros-mes-historia-completa">Caso Laura: De 1.800€ a 3.200€/mes (misma propiedad)</a></li>
<li><a href="/blog/revenue-management-avanzado">Revenue Management Avanzado para Airbnb</a></li>
<li><a href="/blog/del-modo-bombero-al-modo-ceo-framework">Del Modo Bombero al Modo CEO: Framework</a></li>
</ul>
`

async function updateArticle() {
  const result = await prisma.blogPost.update({
    where: { slug: 'revpar-vs-ocupacion-metrica-que-cambia-todo' },
    data: {
      content: newContent,
      excerpt: 'Por qué un 90% de ocupación puede ser buena noticia o una señal de que estás dejando dinero. Aprende a calcular RevPAR bruto y neto con un framework práctico que te dice exactamente cuánto te queda.',
      metaDescription: 'Aprende a calcular RevPAR bruto y neto para tu Airbnb. Framework práctico con tabla de cálculo, metodología de comp set y señales de que estás vendiendo barato.',
      readTime: 15,
      updatedAt: new Date()
    }
  })

  console.log('✅ Artículo actualizado:', result.slug)
  console.log('   Nuevo excerpt:', result.excerpt.substring(0, 80) + '...')
  console.log('   Read time:', result.readTime, 'min')

  await prisma.$disconnect()
}

updateArticle().catch(console.error)
